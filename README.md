

# Navigate Code (Codebase Q&A with Proof)

A web application that enables semantic question-answering over a codebase. Users can upload a ZIP archive or connect a public GitHub repository, ask technical questions about the code, and receive grounded answers with file paths and line references.

The system performs structured chunking, vector embedding, similarity search, and LLM-based answer synthesis with strict grounding constraints.

---

## Overview

This project implements **Option B: Codebase Q&A with Proof**.

It allows users to:

* Upload a ZIP file of a codebase
* Connect a public GitHub repository
* Ask natural language questions about the code
* Receive answers grounded in actual code chunks
* View file paths and line ranges used to generate the answer
* Persist the last 10 Q&A interactions per repository
* Monitor system health via a status page

---
### Deployment

This project is designed to be deployed on Vercel with Supabase as the database and vector store. 

Production Link: https://navigate-code.vercel.app/

---

## How It Works

### 1. Ingestion

The user uploads either:

* A public GitHub repository URL
* A ZIP file containing source code

During ingestion:

* Code files are filtered by extension
* Files are chunked using function-level parsing
* Each chunk is embedded using Gemini embeddings
* Embeddings are stored in Supabase (Postgres + pgvector)

---

### 2. Question Answering (RAG Pipeline)

When a user asks a question:

1. The question is embedded using Gemini.
2. A vector similarity search retrieves the most relevant code chunks.
3. The LLM generates an answer using **only** retrieved chunks.
4. The response returns:

   * The answer
   * File paths
   * Line ranges
5. The Q&A is saved in the database.

Strict grounding rules ensure:

* No invented file paths
* No hallucinated line numbers
* Only retrieved chunks can be referenced

---

### 3. UI Features

* Repository sidebar with selection
* Chat interface (ChatGPT-style layout)
* Markdown-formatted answers
* Reference section below each answer
* Clickable file path badges
* Last 10 Q&A history
* Upload page
* Health status page (backend, database, LLM)

---

## Tech Stack

* Next.js (App Router)
* TypeScript
* Supabase (Postgres + pgvector)
* Gemini (Embeddings + LLM)
* Tailwind CSS
* Sonner (toast notifications)
* JSZip (ZIP ingestion)

---

## Project Structure

```
app/
  page.tsx            → Home page
  upload/             → Repository upload
  repos/              → Q&A interface
  status/             → System health
  api/
    ingest/           → Repository ingestion
    ask/              → Question answering
    history/          → Q&A history
    status/           → Health check
lib/
  chunker.ts          → Code chunking logic
  embeddings.ts       → Embedding generation
  supabase.ts         → Supabase client
```

---

## Database Schema

### repositories

Stores repository metadata.

### code_chunks

Stores:

* repo_id
* file_path
* start_line
* end_line
* content
* embedding (vector)

### qa_history

Stores:

* repo_id
* question
* answer
* answer_references (JSONB)
* created_at

---

## How to Run

### 1. Clone the Repository

```bash
git clone https://github.com/om2137/navigate-code
cd navigate-code
```

---

### 2. Install Dependencies

```bash
npm install
```

---

### 3. Setup Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GEMINI_API_KEY=
```

---

### 4. Setup Supabase

* Enable pgvector
* Create required tables
* Create RPC function `match_code_chunks`

---

### 5. Run Development Server

```bash
npm run dev
```

Application runs at:

```
http://localhost:3000
```

---

## What Was Required

From the specification:

* Upload ZIP or GitHub repository
* Ask semantic questions
* Return answers with file paths + line ranges
* Show retrieved snippets
* Save last 10 Q&As
* Add custom enhancement

---

## Design Decisions

* JSONB for reference storage (flexible, future-proof)
* Strict grounding to prevent hallucinated references
* Deterministic chunk IDs to validate LLM output
* Vector search via Supabase RPC for performance
* Client-side chat layout with server-side RAG

---

## Future Improvements

* Streaming answers
* AST-based multi-language parsing (more language support)
* Code preview drawer with syntax highlighting
* Refactor suggestion mode
* Repository tagging and search
* Authentication layer
* Analytics dashboard

---

## Conclusion

This project demonstrates a complete Retrieval-Augmented Generation (RAG) system tailored for code intelligence.

