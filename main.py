"""
main.py – FastAPI application entry point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.database import engine, Base
from app.routes import auth, chat
from app.config import settings

# ── Create DB tables ──────────────────────────────────────────────────────────
Base.metadata.create_all(bind=engine)

# ── Ensure upload & vectorstore dirs exist ────────────────────────────────────
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.VECTORSTORE_DIR, exist_ok=True)

# ── App factory ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="AI Chatbot API",
    description="Production-ready RAG-powered chatbot backend",
    version="1.0.0",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "AI Chatbot API is running 🚀"}
