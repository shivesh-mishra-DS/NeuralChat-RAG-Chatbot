"""
app/config.py – Centralised settings via pydantic-settings
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # JWT
    SECRET_KEY: str = "change-me-in-production-at-least-32-characters-long"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Database
    DATABASE_URL: str = "sqlite:///./chatbot.db"

    # LLM
    GROQ_API_KEY: str = ""

    # Storage
    UPLOAD_DIR: str = "data/uploads"
    VECTORSTORE_DIR: str = "vectorstore"

    # CORS
    FRONTEND_URL: str = "http://localhost:5173"

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


# Module-level singleton for easy import
settings = get_settings()
