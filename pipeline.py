"""
app/rag/pipeline.py – Retrieval-Augmented Generation pipeline
  • Embeddings : sentence-transformers/all-MiniLM-L6-v2 (free, local)
  • Vector DB  : FAISS (local disk)
  • LLM        : Groq (free tier – llama3-8b-8192)
  • Fallback   : Returns a helpful message when no API key is set
"""

import os
import json
import time
from pathlib import Path
from typing import List

from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferWindowMemory
from langchain_groq import ChatGroq
from langchain.schema import Document

from app.config import settings

# ── Constants ─────────────────────────────────────────────────────────────────
EMBED_MODEL  = "sentence-transformers/all-MiniLM-L6-v2"
FAISS_INDEX  = os.path.join(settings.VECTORSTORE_DIR, "faiss_index")
META_FILE    = os.path.join(settings.VECTORSTORE_DIR, "metadata.json")

# ── Singleton embedding model (loaded once) ───────────────────────────────────
_embeddings = None

def get_embeddings() -> HuggingFaceEmbeddings:
    global _embeddings
    if _embeddings is None:
        _embeddings = HuggingFaceEmbeddings(
            model_name=EMBED_MODEL,
            model_kwargs={"device": "cpu"},
            encode_kwargs={"normalize_embeddings": True},
        )
    return _embeddings


# ── Metadata helpers ──────────────────────────────────────────────────────────
def _load_meta() -> dict:
    if os.path.exists(META_FILE):
        with open(META_FILE) as f:
            return json.load(f)
    return {"documents": []}


def _save_meta(meta: dict):
    os.makedirs(os.path.dirname(META_FILE), exist_ok=True)
    with open(META_FILE, "w") as f:
        json.dump(meta, f, indent=2)


# ── Document ingestion ────────────────────────────────────────────────────────
def ingest_document(file_path: str, filename: str, user_id: int) -> dict:
    """
    Load a PDF or text file, split into chunks, embed, and upsert into FAISS.
    Returns a summary dict.
    """
    ext = Path(file_path).suffix.lower()

    # Load raw document
    if ext == ".pdf":
        loader = PyPDFLoader(file_path)
    elif ext in (".txt", ".md"):
        loader = TextLoader(file_path, encoding="utf-8")
    else:
        raise ValueError(f"Unsupported file type: {ext}")

    raw_docs = loader.load()

    # Add metadata to every chunk
    timestamp = time.time()
    for doc in raw_docs:
        doc.metadata.update({
            "source": filename,
            "user_id": user_id,
            "ingested_at": timestamp,
        })

    # Split into manageable chunks
    splitter = RecursiveCharacterTextSplitter(chunk_size=512, chunk_overlap=64)
    chunks = splitter.split_documents(raw_docs)

    embeddings = get_embeddings()

    # Upsert into FAISS (merge with existing index if present)
    if os.path.exists(FAISS_INDEX):
        vectorstore = FAISS.load_local(
            FAISS_INDEX, embeddings, allow_dangerous_deserialization=True
        )
        vectorstore.add_documents(chunks)
    else:
        vectorstore = FAISS.from_documents(chunks, embeddings)

    vectorstore.save_local(FAISS_INDEX)

    # Persist document metadata
    meta = _load_meta()
    meta["documents"].append({
        "filename": filename,
        "user_id": user_id,
        "chunks": len(chunks),
        "ingested_at": timestamp,
    })
    _save_meta(meta)

    return {"filename": filename, "chunks": len(chunks), "ingested_at": timestamp}


# ── RAG query ─────────────────────────────────────────────────────────────────
def rag_query(question: str, chat_history: List[tuple] = None) -> str:
    """
    Answer a question using the RAG pipeline.
    Falls back to a plain LLM answer if no vectorstore exists.
    """
    if chat_history is None:
        chat_history = []

    if not settings.GROQ_API_KEY:
        return (
            "⚠️  No LLM API key configured. "
            "Please set GROQ_API_KEY in your .env file. "
            "Get a free key at https://console.groq.com"
        )

    # Build LLM
    llm = ChatGroq(
        api_key=settings.GROQ_API_KEY,
        model_name="llama3-8b-8192",
        temperature=0.3,
        max_tokens=1024,
    )

    embeddings = get_embeddings()

    # If we have a vectorstore, use RAG; otherwise plain chat
    if os.path.exists(FAISS_INDEX):
        vectorstore = FAISS.load_local(
            FAISS_INDEX, embeddings, allow_dangerous_deserialization=True
        )
        retriever = vectorstore.as_retriever(
            search_type="similarity", search_kwargs={"k": 4}
        )

        chain = ConversationalRetrievalChain.from_llm(
            llm=llm,
            retriever=retriever,
            return_source_documents=False,
            verbose=False,
        )
        result = chain.invoke({"question": question, "chat_history": chat_history})
        return result["answer"]
    else:
        # No documents uploaded yet – plain LLM
        response = llm.invoke(question)
        return response.content


# ── List ingested docs ────────────────────────────────────────────────────────
def list_documents(user_id: int = None) -> list:
    """Return metadata for ingested documents, optionally filtered by user."""
    meta = _load_meta()
    docs = meta.get("documents", [])
    if user_id is not None:
        docs = [d for d in docs if d.get("user_id") == user_id]
    return docs
