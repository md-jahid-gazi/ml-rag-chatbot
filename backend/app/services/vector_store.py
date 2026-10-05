import math
import numpy as np
from typing import List, Dict, Any, Optional, Tuple
from backend.app.config import settings
from backend.app.core.logger import logger

class HybridVectorStore:
    def __init__(self):
        self.chunks: List[Dict[str, Any]] = []
        self.embedding_model = None
        self.embedding_dim = 384
        self.model_name = settings.EMBEDDING_MODEL_NAME
        self.is_neural_ready = False
        self._init_encoder()

    def _init_encoder(self):
        """Attempt to load SentenceTransformer; fallback to TF-IDF if unavailable"""
        try:
            from sentence_transformers import SentenceTransformer
            logger.info(f"Loading dense embedding model: {self.model_name}...")
            self.embedding_model = SentenceTransformer(self.model_name)
            if hasattr(self.embedding_model, "get_embedding_dimension"):
                self.embedding_dim = self.embedding_model.get_embedding_dimension()
            elif hasattr(self.embedding_model, "get_sentence_embedding_dimension"):
                self.embedding_dim = self.embedding_model.get_sentence_embedding_dimension()
            else:
                self.embedding_dim = 384
            self.is_neural_ready = True
            logger.info(f"Dense embedding model loaded successfully. Dim: {self.embedding_dim}")
        except Exception as e:
            logger.warning(f"Could not load SentenceTransformer ({str(e)}). Using TF-IDF/BM25 dense fallback.")
            self.embedding_model = None
            self.is_neural_ready = False

    def _encode_texts(self, texts: List[str]) -> np.ndarray:
        """Encode a batch of texts into normalized embedding vectors"""
        if not texts:
            return np.empty((0, self.embedding_dim))

        if self.is_neural_ready and self.embedding_model is not None:
            embeddings = self.embedding_model.encode(texts, convert_to_numpy=True, normalize_embeddings=True)
            return embeddings
        else:
            # High-dimensional subword/word TF-IDF n-gram vectorization fallback
            from sklearn.feature_extraction.text import TfidfVectorizer
            corpus = texts + [c["content"] for c in self.chunks]
            vectorizer = TfidfVectorizer(ngram_range=(1, 2), max_features=self.embedding_dim)
            vectorizer.fit(corpus)
            dense_mat = vectorizer.transform(texts).toarray()
            # L2 normalization for cosine similarity via dot product
            norms = np.linalg.norm(dense_mat, axis=1, keepdims=True)
            norms[norms == 0] = 1.0
            return dense_mat / norms

    def add_document_chunks(self, document_id: int, document_title: str, chunks_data: List[Dict[str, Any]]):
        """
        Incrementally add chunks to the vector store without full retraining.
        """
        if not chunks_data:
            return

        texts = [c["content"] for c in chunks_data]
        embeddings = self._encode_texts(texts)

        for i, c in enumerate(chunks_data):
            self.chunks.append({
                "chunk_id": c.get("id"),
                "document_id": document_id,
                "document_title": document_title,
                "chunk_index": c["chunk_index"],
                "content": c["content"],
                "token_count": c.get("token_count", len(c["content"].split())),
                "embedding": embeddings[i]
            })

        logger.info(f"Incrementally added {len(chunks_data)} chunks for Doc #{document_id} ('{document_title}'). Total index size: {len(self.chunks)} chunks.")

    def remove_document(self, document_id: int):
        """
        Incrementally remove document chunks from the vector store.
        """
        initial_len = len(self.chunks)
        self.chunks = [c for c in self.chunks if c["document_id"] != document_id]
        removed = initial_len - len(self.chunks)
        logger.info(f"Removed {removed} chunks for Doc #{document_id}. Total remaining chunks: {len(self.chunks)}")

    def search(self, query: str, top_k: int = None) -> List[Dict[str, Any]]:
        """
        Perform semantic similarity search using Cosine Similarity / Dot Product.
        Formula:
            Cosine Similarity(q, k) = (q · k) / (||q|| * ||k||)
            Since embeddings are L2 normalized, Cosine Similarity == q · k (Dot Product)
        """
        if not self.chunks:
            return []

        top_k = top_k or settings.TOP_K_CHUNKS
        query_vec = self._encode_texts([query])[0]  # shape: (embedding_dim,)

        # Stack chunk vectors
        chunk_embeddings = np.array([c["embedding"] for c in self.chunks])  # shape: (N, dim)

        # Dot product with normalized vectors equals cosine similarity
        scores = np.dot(chunk_embeddings, query_vec)

        # Optional keyword / term-frequency boosting for exact technical acronyms (BERT, VAE, GAN, etc.)
        query_words = set(query.lower().split())
        for idx, chunk in enumerate(self.chunks):
            content_lower = chunk["content"].lower()
            exact_matches = sum(1 for w in query_words if len(w) > 2 and w in content_lower)
            if exact_matches > 0:
                scores[idx] += min(0.08, exact_matches * 0.02)  # subtle hybrid boost

        # Rank by score descending
        ranked_indices = np.argsort(scores)[::-1][:top_k]

        results = []
        for idx in ranked_indices:
            score = float(scores[idx])
            chunk = self.chunks[idx]
            results.append({
                "document_id": chunk["document_id"],
                "document_title": chunk["document_title"],
                "chunk_index": chunk["chunk_index"],
                "content": chunk["content"],
                "relevance_score": round(max(0.0, min(1.0, score)), 4),
                "token_count": chunk["token_count"]
            })

        return results

    def clear(self):
        self.chunks.clear()

    @property
    def total_chunks(self) -> int:
        return len(self.chunks)

# Global singleton vector store instance
vector_store = HybridVectorStore()
