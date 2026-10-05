import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
from pathlib import Path

from backend.app.config import settings, SAMPLE_KB_DIR, BASE_DIR
from backend.app.database import engine, Base, SessionLocal
from backend.app.models.user import User
from backend.app.models.document import Document, DocumentChunk
from backend.app.core.security import hash_password
from backend.app.core.logger import logger
from backend.app.services.document_parser import DocumentParser
from backend.app.services.chunker import RecursiveChunker
from backend.app.services.vector_store import vector_store
from backend.app.api import api_router

def init_db_and_knowledge():
    """Create DB tables, seed admin, and load sample knowledge into vector index"""
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # 1. Seed Default Admin if missing
        admin = db.query(User).filter(User.username == "admin").first()
        if not admin:
            admin = User(
                email=settings.ADMIN_EMAIL,
                username="admin",
                hashed_password=hash_password(settings.ADMIN_PASSWORD),
                role="admin"
            )
            db.add(admin)
            db.commit()
            logger.info(f"Default admin created ({settings.ADMIN_EMAIL} / {settings.ADMIN_PASSWORD})")

        # 2. Check if DB already has documents; if so, populate vector store
        existing_docs = db.query(Document).all()
        if existing_docs:
            logger.info(f"Loading {len(existing_docs)} existing documents into vector store...")
            vector_store.clear()
            for doc in existing_docs:
                chunks = db.query(DocumentChunk).filter(DocumentChunk.document_id == doc.id).order_by(DocumentChunk.chunk_index).all()
                chunks_data = [
                    {
                        "id": c.id,
                        "chunk_index": c.chunk_index,
                        "content": c.content,
                        "token_count": c.token_count
                    }
                    for c in chunks
                ]
                vector_store.add_document_chunks(doc.id, doc.title, chunks_data)
        else:
            # 3. First time startup: auto-index sample knowledge documents
            logger.info("First run detected: indexing sample knowledge files...")
            sample_files = list(SAMPLE_KB_DIR.glob("*.md")) + list(SAMPLE_KB_DIR.glob("*.txt"))
            chunker = RecursiveChunker()

            for path in sample_files:
                filename = path.name
                with open(path, "rb") as f:
                    content_bytes = f.read()

                file_type, text_content = DocumentParser.parse_file(filename, content_bytes)
                title = path.stem.replace("_", " ").title()
                chunks_data = chunker.chunk_text(text_content)

                new_doc = Document(
                    title=title,
                    file_type=file_type,
                    source=filename,
                    file_size=len(content_bytes),
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

                vector_store.add_document_chunks(new_doc.id, new_doc.title, chunks_data)

            logger.info(f"Sample knowledge indexed successfully. Total vectors in memory: {vector_store.total_chunks}")
    except Exception as e:
        logger.error(f"Error during database initialization: {str(e)}")
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting AI-Powered Knowledge Chatbot Backend...")
    init_db_and_knowledge()
    yield
    # Shutdown
    logger.info("Shutting down AI-Powered Knowledge Chatbot Backend...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        "Comprehensive API for an AI-Powered Knowledge Chatbot.\n\n"
        "Features:\n"
        "- Custom Knowledge Base Training and Incremental Updates\n"
        "- Strict Semantic Grounding & Citation Attribution\n"
        "- Graceful Fallback for Out-of-Scope Queries\n"
        "- Multi-format Ingestion (PDF, Text, Markdown, Web Scrape)\n"
        "- Conversation Session Memory\n"
        "- User / Admin Authentication & Role-Based Access Control\n"
        "- Live Server Logging & System Analytics"
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Router
app.include_router(api_router, prefix=settings.API_V1_STR)

# Serve built frontend if dist exists
dist_dir = BASE_DIR / "frontend" / "dist"
if dist_dir.exists():
    app.mount("/assets", StaticFiles(directory=str(dist_dir / "assets")), name="assets")

    @app.get("/")
    def serve_frontend_root():
        from fastapi.responses import FileResponse
        return FileResponse(str(dist_dir / "index.html"))

@app.get("/api/ping")
def ping():
    return {"message": "AI Knowledge Chatbot API is online!", "docs": "/docs"}
