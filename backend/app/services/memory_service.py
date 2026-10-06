import json
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.app.models.chat import ChatSession, ChatMessage
from backend.app.core.logger import logger

class ConversationMemoryService:
    @staticmethod
    def get_or_create_session(db: Session, session_id: Optional[str], user_id: Optional[int] = None, title: str = "New Conversation") -> ChatSession:
        import uuid
        if session_id:
            chat_session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
            if chat_session:
                return chat_session

        new_id = session_id or str(uuid.uuid4())
        chat_session = ChatSession(id=new_id, user_id=user_id, title=title)
        db.add(chat_session)
        db.commit()
        db.refresh(chat_session)
        logger.info(f"Created new chat session: {new_id}")
        return chat_session

    @staticmethod
    def add_message(
        db: Session,
        session_id: str,
        sender: str,
        content: str,
        sources: List[Dict[str, Any]] = None,
        confidence_score: float = 0.0,
        in_scope: bool = True
    ) -> ChatMessage:
        sources_json = json.dumps(sources or [])
        msg = ChatMessage(
            session_id=session_id,
            sender=sender,
            content=content,
            sources_json=sources_json,
            confidence_score=confidence_score,
            in_scope=1 if in_scope else 0
        )
        db.add(msg)
        db.commit()
        db.refresh(msg)
        return msg

    @staticmethod
    def get_recent_messages(db: Session, session_id: str, limit: int = 6) -> List[ChatMessage]:
        """Fetch the most recent turns for short-term conversational context"""
        return db.query(ChatMessage).filter(
            ChatMessage.session_id == session_id
        ).order_by(ChatMessage.created_at.desc()).limit(limit).all()[::-1]

    @staticmethod
    def format_history_for_context(messages: List[ChatMessage]) -> str:
        """Format history into clean dialogue text"""
        if not messages:
            return ""
        lines = []
        for m in messages:
            role = "User" if m.sender == "user" else "Assistant"
            lines.append(f"{role}: {m.content}")
        return "\n".join(lines)

    @staticmethod
    def contextualize_query(query: str, recent_messages: List[ChatMessage]) -> str:
        """
        Lightweight context enrichment: if user asks a pronoun or follow-up question
        ('it', 'they', 'the second one', 'why?'), append context from the last message.
        """
        lower = f" {query.lower().strip()} "
        referential_markers = [" it ", " its ", " that ", " this ", " they ", " them ", " there ", " what about it ", " why? ", " how come? "]
        needs_context = any(m in lower for m in referential_markers)

        if needs_context and recent_messages:
            last_user_msg = next((m for m in reversed(recent_messages) if m.sender == "user"), None)
            if last_user_msg:
                return f"{last_user_msg.content} -> {query}"
        return query
