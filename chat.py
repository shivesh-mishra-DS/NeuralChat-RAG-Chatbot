"""
app/routes/chat.py – Protected chat, document upload, and history endpoints
"""

import os
import shutil
import time
from typing import List

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.models.models import User, ChatMessage
from app.utils.jwt_utils import get_current_user_username
from app.rag.pipeline import ingest_document, rag_query, list_documents
from app.config import settings

router = APIRouter()


# ── Helpers ───────────────────────────────────────────────────────────────────
def _get_user(username: str, db: Session) -> User:
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# ── Schemas ───────────────────────────────────────────────────────────────────
class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    answer: str
    role: str = "assistant"


class HistoryItem(BaseModel):
    role: str
    content: str
    created_at: str


# ── Chat endpoint ─────────────────────────────────────────────────────────────
@router.post("/message", response_model=ChatResponse)
def send_message(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    username: str = Depends(get_current_user_username),
):
    """Send a message and receive a RAG-powered answer."""
    user = _get_user(username, db)

    # Build conversation history for context (last 10 exchanges)
    recent = (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == user.id)
        .order_by(ChatMessage.created_at.desc())
        .limit(20)
        .all()
    )
    recent.reverse()

    # Convert to (human, ai) tuples expected by LangChain
    history_tuples = []
    for i in range(0, len(recent) - 1, 2):
        if recent[i].role == "user" and recent[i + 1].role == "assistant":
            history_tuples.append((recent[i].content, recent[i + 1].content))

    # Save user message
    db.add(ChatMessage(user_id=user.id, role="user", content=payload.message))
    db.commit()

    # Get RAG answer
    answer = rag_query(payload.message, history_tuples)

    # Save assistant reply
    db.add(ChatMessage(user_id=user.id, role="assistant", content=answer))
    db.commit()

    return ChatResponse(answer=answer)


# ── History endpoint ──────────────────────────────────────────────────────────
@router.get("/history", response_model=List[HistoryItem])
def get_history(
    limit: int = 50,
    db: Session = Depends(get_db),
    username: str = Depends(get_current_user_username),
):
    """Fetch the latest N messages for the current user."""
    user = _get_user(username, db)

    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == user.id)
        .order_by(ChatMessage.created_at.desc())
        .limit(limit)
        .all()
    )
    messages.reverse()

    return [
        HistoryItem(
            role=m.role,
            content=m.content,
            created_at=m.created_at.isoformat() if m.created_at else "",
        )
        for m in messages
    ]


# ── Clear history ─────────────────────────────────────────────────────────────
@router.delete("/history")
def clear_history(
    db: Session = Depends(get_db),
    username: str = Depends(get_current_user_username),
):
    """Delete all chat messages for the current user."""
    user = _get_user(username, db)
    db.query(ChatMessage).filter(ChatMessage.user_id == user.id).delete()
    db.commit()
    return {"message": "Chat history cleared"}


# ── Document upload ───────────────────────────────────────────────────────────
ALLOWED_EXTENSIONS = {".pdf", ".txt", ".md"}


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    username: str = Depends(get_current_user_username),
):
    """Upload a PDF or text file and ingest it into the vector store."""
    user = _get_user(username, db)

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Allowed: {ALLOWED_EXTENSIONS}",
        )

    # Save file to disk
    dest = os.path.join(settings.UPLOAD_DIR, f"{user.id}_{int(time.time())}_{file.filename}")
    with open(dest, "wb") as f:
        shutil.copyfileobj(file.file, f)

    # Ingest into FAISS
    result = ingest_document(dest, file.filename, user.id)

    return {
        "message": "Document ingested successfully",
        "filename": result["filename"],
        "chunks": result["chunks"],
        "ingested_at": result["ingested_at"],
    }


# ── List documents ────────────────────────────────────────────────────────────
@router.get("/documents")
def get_documents(username: str = Depends(get_current_user_username), db: Session = Depends(get_db)):
    """List documents the current user has uploaded."""
    user = _get_user(username, db)
    docs = list_documents(user_id=user.id)
    return {"documents": docs}
