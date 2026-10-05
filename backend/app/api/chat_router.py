import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.models.chat import ChatSession, ChatMessage
from backend.app.schemas.chat import (
    ChatQueryRequest,
    ChatMessageResponse,
    ChatSessionCreate,
    ChatSessionResponse,
    ChatHistoryResponse,
    SourceCitation
)
from backend.app.core.security import get_current_user_optional
from backend.app.services.rag_engine import rag_engine
from backend.app.services.memory_service import ConversationMemoryService
from backend.app.core.logger import logger

router = APIRouter(prefix="/chat", tags=["Chat & Conversations"])

@router.post("/message")
def send_chat_message(
    payload: ChatQueryRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Send a message to the chatbot.
    Retrieves knowledge context, generates a grounded response, or returns a polite fallback.
    """
    if not payload.query or not payload.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    user_id = current_user.id if current_user else None

    # Get or create session
    session = ConversationMemoryService.get_or_create_session(
        db=db,
        session_id=payload.session_id,
        user_id=user_id,
        title=payload.query[:35] + ("..." if len(payload.query) > 35 else "")
    )

    # Process via RAG Engine
    result = rag_engine.process_query(
        db=db,
        session_id=session.id,
        user_query=payload.query.strip(),
        top_k=payload.top_k
    )

    return result

@router.get("/sessions", response_model=List[ChatSessionResponse])
def get_user_chat_sessions(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """List chat sessions for the current user or recent active sessions"""
    query = db.query(ChatSession)
    if current_user:
        query = query.filter(ChatSession.user_id == current_user.id)
    else:
        # Return recent guest sessions
        query = query.filter(ChatSession.user_id.is_(None))

    sessions = query.order_by(ChatSession.updated_at.desc()).limit(30).all()
    
    res = []
    for s in sessions:
        res.append(ChatSessionResponse(
            id=s.id,
            title=s.title,
            created_at=s.created_at,
            updated_at=s.updated_at,
            message_count=len(s.messages)
        ))
    return res

@router.post("/sessions", response_model=ChatSessionResponse)
def create_new_session(
    payload: ChatSessionCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Explicitly create a new chat session"""
    user_id = current_user.id if current_user else None
    session = ConversationMemoryService.get_or_create_session(
        db=db,
        session_id=None,
        user_id=user_id,
        title=payload.title or "New Conversation"
    )
    return ChatSessionResponse(
        id=session.id,
        title=session.title,
        created_at=session.created_at,
        updated_at=session.updated_at,
        message_count=0
    )

@router.get("/sessions/{session_id}", response_model=ChatHistoryResponse)
def get_session_history(session_id: str, db: Session = Depends(get_db)):
    """Fetch complete conversation history and sources for a given session"""
    session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    messages_out = []
    for m in session.messages:
        try:
            sources_list = json.loads(m.sources_json or "[]")
        except Exception:
            sources_list = []

        citations = [SourceCitation(**item) for item in sources_list]
        messages_out.append(ChatMessageResponse(
            id=m.id,
            session_id=m.session_id,
            sender=m.sender,
            content=m.content,
            sources=citations,
            confidence_score=m.confidence_score,
            in_scope=bool(m.in_scope),
            created_at=m.created_at
        ))

    return ChatHistoryResponse(
        session=ChatSessionResponse(
            id=session.id,
            title=session.title,
            created_at=session.created_at,
            updated_at=session.updated_at,
            message_count=len(session.messages)
        ),
        messages=messages_out
    )

@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_session(session_id: str, db: Session = Depends(get_db)):
    """Delete a chat session and all its messages"""
    session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if session:
        db.delete(session)
        db.commit()
        logger.info(f"Deleted chat session: {session_id}")
    return None
