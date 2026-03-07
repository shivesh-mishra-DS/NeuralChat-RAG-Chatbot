# NeuralChat – Enterprise RAG Based AI Chatbot

NeuralChat is a full stack AI chatbot that uses Retrieval Augmented Generation (RAG) to answer user queries based on contextual document retrieval. The system integrates semantic vector search, secure authentication, and large language model generation to deliver grounded responses.

The application combines a React frontend with a FastAPI backend and a FAISS vector store to create a scalable AI powered conversational system.

---

## System Architecture

The system follows a layered architecture designed for modular AI applications.

User Interface Layer  
React frontend handles user authentication and chat interaction.

API Layer  
FastAPI backend processes requests and manages authentication.

Intelligence Layer  
RAG pipeline retrieves relevant context and generates AI responses.

Data Layer  
FAISS vector index stores document embeddings for semantic search.

High level flow

User Query  
→ Embedding generation  
→ Vector similarity search  
→ Context retrieval  
→ Prompt construction  
→ LLM response generation  
→ Chat response returned to user

---

## Key Features

Full stack AI chatbot architecture  
Secure authentication using JWT tokens  
Password hashing using bcrypt  
Semantic document retrieval using FAISS vector index  
Sentence transformer embeddings running locally on CPU  
RAG pipeline for contextual question answering  
Modular FastAPI backend architecture  
React based interactive chat interface  
Protected routes for authenticated access  
Responsive chat UI with message history and auto scroll

---

## Tech Stack

Frontend  
React  
Vite  
Tailwind CSS  

Backend  
FastAPI  
SQLAlchemy ORM  
JWT authentication  

AI and NLP  
Sentence Transformers (all MiniLM L6 v2)  
FAISS vector similarity search  
Groq LLM API for response generation  

Database  
SQLite

Tools  
Python  
VS Code  
Git and GitHub

---

## RAG Pipeline Overview

The Retrieval Augmented Generation pipeline improves answer quality by grounding responses in retrieved document context.

Step 1  
User submits a query through the chat interface.

Step 2  
The query is converted into an embedding using a sentence transformer model.

Step 3  
FAISS performs semantic similarity search to retrieve the most relevant document chunks.

Step 4  
The retrieved context is combined with the user query to form a prompt.

Step 5  
The prompt is sent to the LLM for answer generation.

Step 6  
The generated response is returned to the frontend chat interface.

This approach reduces hallucination and improves response accuracy.

---

## Authentication Flow

User registers an account using the frontend interface.

Passwords are hashed using bcrypt before being stored in the database.

During login the server verifies the password and generates a JWT token.

The JWT token is stored on the client and used to access protected API endpoints.

All chat requests require a valid authenticated token.

---

## Project Structure
# NeuralChat – Enterprise RAG Based AI Chatbot

NeuralChat is a full stack AI chatbot that uses Retrieval Augmented Generation (RAG) to answer user queries based on contextual document retrieval. The system integrates semantic vector search, secure authentication, and large language model generation to deliver grounded responses.

The application combines a React frontend with a FastAPI backend and a FAISS vector store to create a scalable AI powered conversational system.

---

## System Architecture

The system follows a layered architecture designed for modular AI applications.

User Interface Layer  
React frontend handles user authentication and chat interaction.

API Layer  
FastAPI backend processes requests and manages authentication.

Intelligence Layer  
RAG pipeline retrieves relevant context and generates AI responses.

Data Layer  
FAISS vector index stores document embeddings for semantic search.

High level flow

User Query  
→ Embedding generation  
→ Vector similarity search  
→ Context retrieval  
→ Prompt construction  
→ LLM response generation  
→ Chat response returned to user

---

## Key Features

Full stack AI chatbot architecture  
Secure authentication using JWT tokens  
Password hashing using bcrypt  
Semantic document retrieval using FAISS vector index  
Sentence transformer embeddings running locally on CPU  
RAG pipeline for contextual question answering  
Modular FastAPI backend architecture  
React based interactive chat interface  
Protected routes for authenticated access  
Responsive chat UI with message history and auto scroll

---

## Tech Stack

Frontend  
React  
Vite  
Tailwind CSS  

Backend  
FastAPI  
SQLAlchemy ORM  
JWT authentication  

AI and NLP  
Sentence Transformers (all MiniLM L6 v2)  
FAISS vector similarity search  
Groq LLM API for response generation  

Database  
SQLite

Tools  
Python  
VS Code  
Git and GitHub

---

## RAG Pipeline Overview

The Retrieval Augmented Generation pipeline improves answer quality by grounding responses in retrieved document context.

Step 1  
User submits a query through the chat interface.

Step 2  
The query is converted into an embedding using a sentence transformer model.

Step 3  
FAISS performs semantic similarity search to retrieve the most relevant document chunks.

Step 4  
The retrieved context is combined with the user query to form a prompt.

Step 5  
The prompt is sent to the LLM for answer generation.

Step 6  
The generated response is returned to the frontend chat interface.

This approach reduces hallucination and improves response accuracy.

---

## Authentication Flow

User registers an account using the frontend interface.

Passwords are hashed using bcrypt before being stored in the database.

During login the server verifies the password and generates a JWT token.

The JWT token is stored on the client and used to access protected API endpoints.

All chat requests require a valid authenticated token.

---

## Project Structure
backend
├── auth.py
├── chat.py
├── config.py
├── database.py
├── jwt_utils.py
├── models.py
├── password.py
├── pipeline.py
└── main.py

frontend
├── src
│ ├── App.jsx
│ ├── ChatPage.jsx
│ ├── LoginPage.jsx
│ ├── RegisterPage.jsx
│ ├── AuthContext.jsx
│ ├── ProtectedRoute.jsx
│ └── api.js
├── index.html
└── vite.config.js

NeuralChat_Enterprise_Docs.html
