
## Use of AI During Development

AI assistance was used for:

* Brainstorming architectural approaches for a RAG-based system
* Reviewing prompt design for strict grounding
* Improving UI layout and user experience decisions
* Identifying edge cases in ingestion and vector search logic
* Refining documentation clarity

AI was not used to auto-generate the entire project. The core implementation, data modeling, RAG pipeline, database schema, ingestion flow, and strict grounding mechanism were manually designed and implemented.
ChatGPT was the only AI tool used for assistance.

---

## What Was Implemented and Verified Manually

The following components were designed and validated manually with the help of AI:

* Repository ingestion logic (GitHub + ZIP)
* File filtering and parsing pipeline
* Functional chunking implementation
* Supabase vector search RPC integration
* Database schema design
* History persistence with JSONB references
* Chat UI architecture
* Reference rendering logic
* Mobile responsiveness
* Duplicate ingestion protection

---

## LLM and Embedding Provider

This application uses:

* **Provider:** Google
* **LLM:** Gemini 3 Flash (via `@google/genai`)
* **Embedding Model:** `gemini-embedding-001`

I had prior experience working with the Gemini API, and given the time constraints, I decided to proceed with it for this implementation.
