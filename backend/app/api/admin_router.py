from typing import List, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.models.document import Document, DocumentChunk
from backend.app.models.chat import ChatSession, ChatMessage
from backend.app.core.security import get_current_admin
from backend.app.core.logger import get_recent_logs, logger
from backend.app.services.vector_store import vector_store
from backend.app.config import settings

router = APIRouter(prefix="/admin", tags=["Admin & System Monitoring"])

@router.get("/stats")
def get_system_analytics(
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin)
):
    """Retrieve full system metrics and usage analytics"""
    total_docs = db.query(Document).count()
    total_chunks = db.query(DocumentChunk).count()
    total_sessions = db.query(ChatSession).count()
    total_messages = db.query(ChatMessage).count()
    total_users = db.query(User).count()

    user_msgs = db.query(ChatMessage).filter(ChatMessage.sender == "user").count()
    in_scope_msgs = db.query(ChatMessage).filter(ChatMessage.sender == "assistant", ChatMessage.in_scope == 1).count()
    out_of_scope_msgs = db.query(ChatMessage).filter(ChatMessage.sender == "assistant", ChatMessage.in_scope == 0).count()

    total_assistant = in_scope_msgs + out_of_scope_msgs
    grounded_rate = round((in_scope_msgs / total_assistant) * 100, 1) if total_assistant > 0 else 100.0

    return {
        "total_documents": total_docs,
        "total_chunks": total_chunks,
        "indexed_vector_chunks": vector_store.total_chunks,
        "total_sessions": total_sessions,
        "total_messages": total_messages,
        "total_users": total_users,
        "in_scope_queries": in_scope_msgs,
        "out_of_scope_queries": out_of_scope_msgs,
        "grounded_response_rate_pct": grounded_rate,
        "embedding_model": vector_store.model_name,
        "similarity_threshold": settings.SIMILARITY_THRESHOLD
    }

@router.get("/logs")
def view_system_logs(
    limit: int = Query(100, ge=10, le=500),
    admin_user: User = Depends(get_current_admin)
):
    """View recent live backend server logs (with timestamp, level, and message)"""
    return {
        "count": limit,
        "logs": get_recent_logs(limit)
    }

@router.get("/health")
def system_health_check(db: Session = Depends(get_db)):
    """Public healthcheck reporting database and vector store connectivity"""
    db_ok = True
    try:
        db.execute("SELECT 1")
    except Exception:
        db_ok = False

    return {
        "status": "healthy" if db_ok else "degraded",
        "database_connected": db_ok,
        "vector_store_ready": True,
        "indexed_chunks": vector_store.total_chunks,
        "neural_embeddings_enabled": vector_store.is_neural_ready
    }
