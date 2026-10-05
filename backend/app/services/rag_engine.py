import re
import requests
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session

from backend.app.config import settings
from backend.app.core.logger import logger
from backend.app.services.vector_store import vector_store
from backend.app.services.memory_service import ConversationMemoryService
from backend.app.models.chat import ChatMessage

class RAGEngine:
    def __init__(self):
        self.threshold = settings.SIMILARITY_THRESHOLD
        self.top_k = settings.TOP_K_CHUNKS

    def process_query(
        self,
        db: Session,
        session_id: str,
        user_query: str,
        top_k: int = None
    ) -> Dict[str, Any]:
        """
        Main RAG pipeline:
        1. Query contextualization using conversation memory.
        2. Semantic vector search across indexed knowledge base.
        3. Threshold-based scope verification.
        4. Grounded answer generation or graceful fallback.
        5. Persisting conversation turn.
        """
        top_k = top_k or self.top_k

        # 1. Fetch short-term conversation context
        recent_messages = ConversationMemoryService.get_recent_messages(db, session_id, limit=4)
        enriched_query = ConversationMemoryService.contextualize_query(user_query, recent_messages)
        conversation_context = ConversationMemoryService.format_history_for_context(recent_messages)

        logger.info(f"Session [{session_id}] Processing query: '{user_query}' (Enriched: '{enriched_query}')")

        # Record user message in DB
        ConversationMemoryService.add_message(
            db=db,
            session_id=session_id,
            sender="user",
            content=user_query
        )

        # 2. Semantic Search
        retrieved_chunks = vector_store.search(enriched_query, top_k=top_k)

        max_score = retrieved_chunks[0]["relevance_score"] if retrieved_chunks else 0.0
        logger.info(f"Search retrieved {len(retrieved_chunks)} chunks. Max relevance score: {max_score:.4f} (Threshold: {self.threshold})")

        # 3. Scope Evaluation
        in_scope = bool(retrieved_chunks and max_score >= self.threshold)

        if not in_scope:
            # Graceful Out-of-Scope Fallback
            answer = self._generate_out_of_scope_response(user_query, max_score)
            source_citations = []
            confidence = max_score
        else:
            # Filter chunks that meet a reasonable fraction of the top score
            qualifying_chunks = [c for c in retrieved_chunks if c["relevance_score"] >= max(self.threshold - 0.05, 0.25)]
            if not qualifying_chunks:
                qualifying_chunks = retrieved_chunks[:2]

            # Generate grounded response
            answer = self._generate_grounded_response(
                query=user_query,
                chunks=qualifying_chunks,
                conversation_context=conversation_context
            )
            source_citations = [
                {
                    "document_id": c["document_id"],
                    "document_title": c["document_title"],
                    "chunk_index": c["chunk_index"],
                    "relevance_score": c["relevance_score"],
                    "excerpt": c["content"][:240] + ("..." if len(c["content"]) > 240 else "")
                }
                for c in qualifying_chunks
            ]
            confidence = max_score

        # Save assistant message in DB
        assistant_msg = ConversationMemoryService.add_message(
            db=db,
            session_id=session_id,
            sender="assistant",
            content=answer,
            sources=source_citations,
            confidence_score=confidence,
            in_scope=in_scope
        )

        return {
            "message_id": assistant_msg.id,
            "session_id": session_id,
            "answer": answer,
            "sources": source_citations,
            "confidence_score": confidence,
            "in_scope": in_scope
        }

    def _generate_out_of_scope_response(self, query: str, score: float) -> str:
        """Polite, graceful fallback when question is outside the knowledge base scope"""
        return (
            f"I apologize, but I could not find verified information about **\"{query}\"** "
            f"in the currently provided knowledge base (relevance confidence: {score:.1%}).\n\n"
            f"As an AI assistant strictly grounded in the knowledge base, I am programmed **not** to speculate "
            f"or answer questions outside my verified documents.\n\n"
            f"### Topics available in the current Knowledge Base:\n"
            f"- **Sequence-to-Sequence & Attention Mechanisms** (Encoder-Decoder, Teacher Forcing, Information Bottleneck, Bahdanau vs. Luong scoring)\n"
            f"- **Transformers & BERT** (Positional Encoding, Multi-Head Self-Attention, Causal Masking, MLM & NSP pretraining, Fine-tuning)\n"
            f"- **Deep Generative Modeling** (Autoencoders, Variational Autoencoders, Reparameterization Trick, KL Divergence, GANs, Minimax Game, StyleGAN, CycleGAN)\n\n"
            f"*Tip: If you are an administrator, you can upload documents (PDF, Markdown, Text, or Web URLs) in the **Knowledge Base** tab to expand my scope!*"
        )

    def _generate_grounded_response(
        self,
        query: str,
        chunks: List[Dict[str, Any]],
        conversation_context: str
    ) -> str:
        """
        Synthesize response strictly grounded on the retrieved context.
        Supports external LLM API if key is configured, with robust local synthesis fallback.
        """
        # 1. Try Gemini API if key is provided
        if settings.GEMINI_API_KEY:
            try:
                resp = self._call_gemini(query, chunks, conversation_context)
                if resp:
                    return resp
            except Exception as e:
                logger.warning(f"Gemini API call failed, falling back to local synthesis: {str(e)}")

        # 2. Try OpenAI API if key is provided
        if settings.OPENAI_API_KEY:
            try:
                resp = self._call_openai(query, chunks, conversation_context)
                if resp:
                    return resp
            except Exception as e:
                logger.warning(f"OpenAI API call failed, falling back to local synthesis: {str(e)}")

        # 3. High quality local synthesis engine (deterministic, zero latency, no API keys needed)
        return self._local_grounded_synthesis(query, chunks)

    def _local_grounded_synthesis(self, query: str, chunks: List[Dict[str, Any]]) -> str:
        """
        Intelligent local context synthesizer:
        Ranks relevant sentences and paragraphs from top chunks, extracts definitions,
        equations, and key points directly answering the query with document attribution.
        """
        query_words = set(re.findall(r'\w+', query.lower()))
        # Remove common stop words
        stops = {"what", "is", "the", "how", "does", "explain", "in", "a", "an", "and", "of", "to", "for", "why", "are", "with", "between"}
        keywords = [w for w in query_words if w not in stops and len(w) > 2]

        assembled_points = []
        seen_sentences = set()

        for chunk in chunks:
            doc_title = chunk["document_title"]
            text = chunk["content"]

            # Split by lines or paragraphs
            paragraphs = [p.strip() for p in text.split("\n") if p.strip()]

            for p in paragraphs:
                p_lower = p.lower()
                # Check keyword overlap
                match_count = sum(1 for kw in keywords if kw in p_lower)
                
                # Check for headings or equations
                is_heading = p.startswith("#")
                has_math = "$" in p or "=" in p or "Formula" in p or "Score" in p

                if match_count >= 1 or has_math or is_heading:
                    clean_p = p.lstrip("#").strip()
                    if clean_p and clean_p not in seen_sentences:
                        seen_sentences.add(clean_p)
                        assembled_points.append({
                            "text": clean_p,
                            "match_score": match_count + (1 if has_math else 0),
                            "doc_title": doc_title,
                            "chunk_index": chunk["chunk_index"]
                        })

        if not assembled_points:
            # Fallback to the top chunk verbatim
            top_chunk = chunks[0]
            return f"Based on **{top_chunk['document_title']}** (Section #{top_chunk['chunk_index']}):\n\n{top_chunk['content']}"

        # Sort by match score
        assembled_points.sort(key=lambda x: x["match_score"], reverse=True)

        # Group and construct response
        primary_doc = chunks[0]["document_title"]
        response_sections = [
            f"Based on the verified knowledge base (**{primary_doc}**):\n"
        ]

        # Select top relevant points
        selected = assembled_points[:6]
        for item in selected:
            t = item["text"]
            if t.startswith("-") or t.startswith("*"):
                response_sections.append(t)
            elif ":" in t and len(t.split(":")[0]) < 40:
                response_sections.append(f"\n**{t.split(':')[0].strip()}**: {':'.join(t.split(':')[1:]).strip()}")
            else:
                response_sections.append(f"\n{t}")

        # Add explicit citation note
        response_sections.append(
            f"\n\n---\n*Sources consulted: {', '.join(set(c['document_title'] for c in chunks))}*"
        )

        return "\n".join(response_sections)

    def _call_gemini(self, query: str, chunks: List[Dict[str, Any]], conversation_context: str) -> str:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
        context_str = "\n\n".join([f"--- Source: {c['document_title']} (Chunk {c['chunk_index']}) ---\n{c['content']}" for c in chunks])
        
        prompt = (
            "You are a strict, factual AI assistant for a Machine Learning course. "
            "You must answer the user's question using ONLY the provided context documents below. "
            "Do NOT use external knowledge. If the provided context does not contain the answer, "
            "say 'This information is not found in the provided knowledge base.'\n\n"
            f"Context Documents:\n{context_str}\n\n"
            f"Conversation History:\n{conversation_context}\n\n"
            f"User Question: {query}\n\n"
            "Provide a thorough, beautifully formatted response in markdown with formulas if applicable:"
        )
        payload = {"contents": [{"parts": [{"text": prompt}]}]}
        res = requests.post(url, json=payload, timeout=20)
        res.raise_for_status()
        data = res.json()
        return data["candidates"][0]["content"]["parts"][0]["text"]

    def _call_openai(self, query: str, chunks: List[Dict[str, Any]], conversation_context: str) -> str:
        context_str = "\n\n".join([f"--- Source: {c['document_title']} (Chunk {c['chunk_index']}) ---\n{c['content']}" for c in chunks])
        headers = {"Authorization": f"Bearer {settings.OPENAI_API_KEY}", "Content-Type": "application/json"}
        payload = {
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": "You are a factual AI assistant. Answer using ONLY the provided context. If unknown from context, state that it is not in the knowledge base."},
                {"role": "user", "content": f"Context:\n{context_str}\n\nHistory:\n{conversation_context}\n\nQuestion: {query}"}
            ]
        }
        res = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload, timeout=20)
        res.raise_for_status()
        return res.json()["choices"][0]["message"]["content"]

# Singleton RAG Engine
rag_engine = RAGEngine()
