import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"
UPLOADS_DIR = DATA_DIR / "uploads"
SAMPLE_KB_DIR = DATA_DIR / "sample_knowledge"
LOGS_DIR = BASE_DIR / "logs"

# Ensure directories exist
DATA_DIR.mkdir(parents=True, exist_ok=True)
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
SAMPLE_KB_DIR.mkdir(parents=True, exist_ok=True)
LOGS_DIR.mkdir(parents=True, exist_ok=True)

class Settings(BaseSettings):
    PROJECT_NAME: str = "BRACU ML AI Knowledge Chatbot"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = "bracu-ml-secret-key-super-secure-change-in-prod-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Database
    DATABASE_URL: str = f"sqlite:///{DATA_DIR / 'database.sqlite'}"

    # Retrieval and Grounding Settings
    # Minimum similarity threshold to accept query as in-scope
    SIMILARITY_THRESHOLD: float = 0.32
    TOP_K_CHUNKS: int = 4
    CHUNK_SIZE: int = 600
    CHUNK_OVERLAP: int = 100

    # Model settings
    EMBEDDING_MODEL_NAME: str = "all-MiniLM-L6-v2"
    USE_GPU: bool = False
    
    # Optional external API keys (defaults to local intelligent synthesis)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")

    # Admin default credentials
    ADMIN_EMAIL: str = "admin@bracu.ac.bd"
    ADMIN_PASSWORD: str = "admin123"

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "allow"

settings = Settings()
