from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, HttpUrl

class DocumentChunkResponse(BaseModel):
    id: int
    chunk_index: int
    content: str
    token_count: int

    class Config:
        from_attributes = True

class DocumentResponse(BaseModel):
    id: int
    title: str
    file_type: str
    source: str
    file_size: int
    num_chunks: int
    created_at: datetime

    class Config:
        from_attributes = True

class DocumentDetailResponse(DocumentResponse):
    chunks: List[DocumentChunkResponse] = []

class WebScrapeRequest(BaseModel):
    url: str
    title: Optional[str] = None

class KnowledgeBaseStats(BaseModel):
    total_documents: int
    total_chunks: int
    file_types: dict
    active_embedding_model: str
    similarity_threshold: float
