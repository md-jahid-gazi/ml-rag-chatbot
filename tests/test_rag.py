import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.vector_store import vector_store
from backend.app.services.chunker import RecursiveChunker

def test_api_ping():
    with TestClient(app) as client:
        response = client.get("/api/ping")
        assert response.status_code == 200
        assert response.json()["message"] == "AI Knowledge Chatbot API is online!"

def test_vector_store_indexed():
    with TestClient(app) as client:
        assert vector_store.total_chunks > 0, "Vector store should have chunks from sample knowledge base"

def test_in_scope_query():
    with TestClient(app) as client:
        payload = {
            "query": "What is the reparameterization trick in Variational Autoencoders?",
            "top_k": 3
        }
        response = client.post("/api/chat/message", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["in_scope"] is True
        assert data["confidence_score"] > 0.30
        assert len(data["sources"]) > 0
        assert "reparameterization" in data["answer"].lower() or "trick" in data["answer"].lower()

def test_out_of_scope_query():
    with TestClient(app) as client:
        payload = {
            "query": "What are the best tourist spots in Paris for vacation?",
            "top_k": 3
        }
        response = client.post("/api/chat/message", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["in_scope"] is False
        assert len(data["sources"]) == 0
        assert "not find" in data["answer"].lower() or "outside" in data["answer"].lower() or "apologize" in data["answer"].lower()

def test_chunker_cohesion():
    text = (
        "Sequence to sequence models map an input sequence to an output sequence.\n\n"
        "Attention mechanisms solve the information bottleneck by dynamically attending to encoder states.\n\n"
        "Transformers rely purely on self-attention mechanisms without recurrence or convolutions."
    )
    chunker = RecursiveChunker(chunk_size=100, chunk_overlap=20)
    chunks = chunker.chunk_text(text)
    assert len(chunks) >= 2
    assert all("content" in c for c in chunks)

def test_auth_and_admin_protection():
    with TestClient(app) as client:
        # Unauthorized delete attempt returns 401
        response = client.delete("/api/kb/documents/9999")
        assert response.status_code == 401

        # Login as admin
        login_res = client.post(
            "/api/auth/login",
            data={"username": "admin", "password": "admin123"}
        )
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]
        assert token is not None

        # Access protected admin logs (limit >= 10)
        logs_res = client.get("/api/admin/logs?limit=20", headers={"Authorization": f"Bearer {token}"})
        assert logs_res.status_code == 200
        assert "logs" in logs_res.json()
