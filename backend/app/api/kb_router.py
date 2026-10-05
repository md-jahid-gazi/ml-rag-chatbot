import os
import shutil
from pathlib import Path
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session

from backend.app.config import settings, UPLOADS_DIR, SAMPLE_KB_DIR
from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.models.document import Document, DocumentChunk
from backend.app.schemas.document import (
    DocumentResponse,
    DocumentDetailResponse,
    DocumentChunkResponse,
    WebScrapeRequest,
    KnowledgeBaseStats
)
from backend.app.core.security import get_current_user_optional, get_current_admin
from backend.app.services.document_parser import DocumentParser
from backend.app.services.chunker import RecursiveChunker
from backend.app.services.vector_store import vector_store
from backend.app.core.logger import logger

router = APIRouter(prefix="/kb", tags=["Knowledge Base Management"])

@router.get("/documents", response_model=List[DocumentResponse])
def list_documents(db: Session = Depends(get_db)):
    """List all documents currently registered in the knowledge base"""
    docs = db.query(Document).order_by(Document.created_at.desc()).all()
    return docs

@router.get("/documents/{document_id}", response_model=DocumentDetailResponse)
def get_document_details(document_id: int, db: Session = Depends(get_db)):
    """Get document metadata along with all its indexed chunks"""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    custom_title: str = Form(None),
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin)
):
    """
    Upload a document (PDF, Markdown, Text, CSV, JSON).
    Incrementally parses, chunks, and vectors into knowledge base without full retraining.
    """
    filename = file.filename
    content_bytes = await file.read()
    file_size = len(content_bytes)

    if file_size == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    # Save to disk
    save_path = UPLOADS_DIR / filename
    with open(save_path, "wb") as f:
        f.write(content_bytes)

    # 1. Parse text based on format
    try:
        file_type, text_content = DocumentParser.parse_file(filename, content_bytes)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse document: {str(e)}")

    if not text_content or not text_content.strip():
        raise HTTPException(status_code=400, detail="No readable text could be extracted from this file.")

    title = custom_title or Path(filename).stem.replace("_", " ").title()

    # 2. Chunk text
    chunker = RecursiveChunker()
    chunks_data = chunker.chunk_text(text_content)

    # 3. Create Document record in DB
    new_doc = Document(
        title=title,
        file_type=file_type,
        source=filename,
        file_size=file_size,
        num_chunks=len(chunks_data)
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)

    # 4. Save chunks in DB
    db_chunks = []
    for c in chunks_data:
        chunk_obj = DocumentChunk(
            document_id=new_doc.id,
            chunk_index=c["chunk_index"],
            content=c["content"],
            token_count=c["token_count"]
        )
        db.add(chunk_obj)
        db_chunks.append(chunk_obj)

    db.commit()

    # 5. Incremental index update in Vector Store
    vector_store.add_document_chunks(
        document_id=new_doc.id,
        document_title=new_doc.title,
        chunks_data=chunks_data
    )

    logger.info(f"Admin '{admin_user.username}' uploaded Doc #{new_doc.id} ('{title}') with {len(chunks_data)} chunks.")
    return new_doc

@router.post("/scrape", response_model=DocumentResponse)
def scrape_web_page(
    payload: WebScrapeRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin)
):
    """
    Scrape content from a live Web URL and index it directly into the knowledge base.
    """
    try:
        extracted_title, text_content = DocumentParser.scrape_url(payload.url)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    title = payload.title or extracted_title or payload.url
    chunker = RecursiveChunker()
    chunks_data = chunker.chunk_text(text_content)

    new_doc = Document(
        title=title,
        file_type="url",
        source=payload.url,
        file_size=len(text_content.encode("utf-8")),
        num_chunks=len(chunks_data)
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)

    for c in chunks_data:
        chunk_obj = DocumentChunk(
            document_id=new_doc.id,
            chunk_index=c["chunk_index"],
            content=c["content"],
            token_count=c["token_count"]
        )
        db.add(chunk_obj)

    db.commit()

    # Incremental update
    vector_store.add_document_chunks(
        document_id=new_doc.id,
        document_title=new_doc.title,
        chunks_data=chunks_data
    )

    logger.info(f"Admin '{admin_user.username}' scraped URL '{payload.url}' -> Doc #{new_doc.id} with {len(chunks_data)} chunks.")
    return new_doc

@router.delete("/documents/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin)
):
    """
    Delete a document and incrementally remove its vectors without rebuilding the whole index.
    """
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    title = doc.title
    db.delete(doc)
    db.commit()

    # Remove from vector store
    vector_store.remove_document(document_id)
    logger.info(f"Admin '{admin_user.username}' deleted Doc #{document_id} ('{title}')")
    return None

@router.post("/sync-sample")
def sync_sample_knowledge_base(db: Session = Depends(get_db)):
    """
    Scan data/sample_knowledge/ directory and index any missing documents into the KB.
    """
    indexed_sources = set(row[0] for row in db.query(Document.source).all())
    sample_files = list(SAMPLE_KB_DIR.glob("*.md")) + list(SAMPLE_KB_DIR.glob("*.txt"))

    newly_added = 0
    chunker = RecursiveChunker()

    for path in sample_files:
        filename = path.name
        if filename in indexed_sources:
            continue

        with open(path, "rb") as f:
            bytes_data = f.read()

        file_type, text_content = DocumentParser.parse_file(filename, bytes_data)
        title = path.stem.replace("_", " ").title()
        chunks_data = chunker.chunk_text(text_content)

        new_doc = Document(
            title=title,
            file_type=file_type,
            source=filename,
            file_size=len(bytes_data),
            num_chunks=len(chunks_data)
        )
        db.add(new_doc)
        db.commit()
        db.refresh(new_doc)

        for c in chunks_data:
            chunk_obj = DocumentChunk(
                document_id=new_doc.id,
                chunk_index=c["chunk_index"],
                content=c["content"],
                token_count=c["token_count"]
            )
            db.add(chunk_obj)
        db.commit()

        vector_store.add_document_chunks(
            document_id=new_doc.id,
            document_title=new_doc.title,
            chunks_data=chunks_data
        )
        newly_added += 1

    return {
        "status": "success",
        "newly_indexed_docs": newly_added,
        "total_documents": db.query(Document).count(),
        "total_vector_chunks": vector_store.total_chunks
    }

@router.get("/stats", response_model=KnowledgeBaseStats)
def get_kb_stats(db: Session = Depends(get_db)):
    """Get aggregated statistics about the knowledge base"""
    docs = db.query(Document).all()
    type_counts = {}
    total_chunks = 0
    for d in docs:
        type_counts[d.file_type] = type_counts.get(d.file_type, 0) + 1
        total_chunks += d.num_chunks

    return KnowledgeBaseStats(
        total_documents=len(docs),
        total_chunks=total_chunks,
        file_types=type_counts,
        active_embedding_model=vector_store.model_name,
        similarity_threshold=settings.SIMILARITY_THRESHOLD
    )
