# Prompt 03 — Build RAG Ingestion

/local
/auto-context

Build the document ingestion and retrieval foundation.

Read:
@docs/technical/04-rag-data-design.md
@docs/03-data-inventory.md
@data/source-pdfs/
@docs/tasks.md
@docs/progress.md

Work Package:
1. Extract text from PDF/XLSX files.
2. Save extracted text under data/extracted/.
3. Chunk extracted documents into data/chunks/.
4. Create metadata for each chunk: source file, page/section if possible, document type, service category.
5. Implement local JSON fallback retrieval first.
6. Prepare Supabase pgvector schema but do not require cloud setup for local demo.

Rules:
- Do not commit raw source PDFs to public repo.
- Do not invent extracted content.
- Mark extraction failures clearly.
- Update docs/progress.md and docs/tasks.md.
- Return files changed, commands run, and extraction summary.
