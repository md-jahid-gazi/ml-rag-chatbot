from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

class SourceCitation(BaseModel):
    document_id: int
    document_title: str
    chunk_index: int
    relevance_score: float
    excerpt: str

class ChatQueryRequest(BaseModel):
    session_id: Optional[str] = None
    query: str
    top_k: Optional[int] = 4

class ChatMessageResponse(BaseModel):
    id: int
    session_id: str
    sender: str
    content: str
    sources: List[SourceCitation] = []
    confidence_score: float
    in_scope: bool
    created_at: datetime

class ChatSessionCreate(BaseModel):
    title: Optional[str] = "New Conversation"

class ChatSessionResponse(BaseModel):
    id: str
    title: str
    created_at: datetime
    updated_at: datetime
    message_count: Optional[int] = 0

    class Config:
        from_attributes = True

class ChatHistoryResponse(BaseModel):
    session: ChatSessionResponse
    messages: List[ChatMessageResponse]
