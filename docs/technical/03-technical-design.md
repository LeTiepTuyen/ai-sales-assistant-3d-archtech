# Technical Design Document

Project: AI Sales Assistant for 3D Archtech  
Version: 1.0  
Date: 2026-06-05  
Status: Planning baseline before coding

## 1. Technical Goals

The system should provide a maintainable local-first MVP that demonstrates retrieval-augmented generation over internal sales materials. It should prioritize simple architecture, low cost, and clear source handling.

## 2. Recommended Stack

| Layer | Recommendation | Rationale |
|---|---|---|
| Web framework | Next.js App Router with TypeScript | Matches project guidance and supports API routes, server components, and deployment to Vercel. |
| Styling | Tailwind CSS with shadcn/ui | Fast professional UI development with reusable components. |
| AI orchestration | Vercel AI SDK | Provides a practical interface for streaming responses and model calls. |
| Model provider | Google Gemini API if available | Suggested by project guidance and suitable for low-cost demo usage. |
| Embeddings | Gemini embedding model if available; otherwise local placeholder index for demo fallback | Keeps the system aligned with the generation provider where feasible. |
| Local storage | JSON files under a non-public data directory | Supports local-first demo without managed infrastructure. |
| Deployed storage | Supabase Postgres with pgvector if deployment persistence is needed | Low-cost vector database option. |
| PDF parsing | Node-based extraction library selected during implementation | Keeps ingestion in the TypeScript stack. |
| XLSX parsing | `xlsx` or equivalent Node package | Required for prompt-library ingestion. |
| DOCX export | `docx` package | Direct generation of downloadable Word documents. |
| PDF export | Print-friendly HTML route | Avoids heavy PDF infrastructure for the MVP. |

No custom model training or fine-tuning is recommended for the MVP. The available documents are better suited to RAG because the goal is source-grounded reuse, not learning new model behavior.

## 3. High-Level Architecture

```text
User Interface
  - Chatbox
  - Proposal Generator
  - Admin Data Sources
  - Proposal Preview and Export

Next.js Server/API Layer
  - Chat API
  - Proposal API
  - Ingestion API
  - Export API

Application Services
  - Intent Router
  - Retrieval Service
  - Prompt Template Service
  - Proposal Composer
  - Citation Builder
  - Data Source Service

Storage
  - Local document registry JSON
  - Local extracted text JSON
  - Local chunk JSON
  - Local embeddings JSON or Supabase pgvector

External AI Provider
  - Gemini generation model
  - Gemini embedding model if approved and configured
```

## 4. Main Modules

### 4.1 UI Routes

| Route | Purpose |
|---|---|
| `/` | Default workspace, likely redirecting to chat or showing app shell. |
| `/chat` | Knowledge-base Q&A and technical explanation. |
| `/proposal` | Client input form and proposal generation workflow. |
| `/proposal/[id]` | Proposal preview, editing, source review, and export. |
| `/admin/data-sources` | Source document registry and ingestion controls. |

### 4.2 API Routes

| Route | Purpose |
|---|---|
| `POST /api/chat` | Handle chat requests, retrieval, and model response. |
| `POST /api/proposals/generate` | Generate proposal draft from form input and retrieved context. |
| `GET /api/proposals/[id]` | Load a generated proposal draft. |
| `POST /api/proposals/[id]/export/docx` | Generate DOCX export. |
| `GET /api/data-sources` | List available source files and ingestion status. |
| `POST /api/data-sources/ingest` | Run ingestion for selected source files. |

### 4.3 Services

| Service | Responsibility |
|---|---|
| DataSourceService | Discover files, track metadata, and store ingestion status. |
| DocumentParserService | Extract text from PDF/XLSX sources. |
| ChunkingService | Split extracted text into retrieval chunks. |
| EmbeddingService | Create and store embeddings when API keys are configured. |
| RetrievalService | Retrieve relevant chunks for a user request. |
| IntentRouter | Classify request into Q&A, explanation, proposal, or prompt-library workflow. |
| PromptTemplateService | Load and apply prompt-library templates. |
| ProposalComposer | Assemble proposal sections with source context and `NEEDS_INPUT`. |
| CitationService | Attach document and chunk references to answers. |
| ExportService | Produce DOCX and print-friendly proposal output. |

## 5. Data Flow

### 5.1 Ingestion Flow

1. Admin places files under `data/source-pdfs/`.
2. System discovers files and records metadata.
3. Parser extracts text from PDF/XLSX.
4. Extracted text is normalized and stored outside public assets.
5. Text is chunked with document metadata.
6. Embeddings are generated if an embedding provider is configured.
7. Chunks and embeddings are saved locally or in Supabase pgvector.
8. Admin page displays ingestion status and any warnings.

### 5.2 Chat Flow

1. User submits a question.
2. IntentRouter classifies the request.
3. RetrievalService searches relevant chunks.
4. PromptTemplateService selects the appropriate response instruction.
5. AI model generates an answer using retrieved context and user question.
6. CitationService attaches source references.
7. UI displays the answer, sources, and missing-input markers.

### 5.3 Proposal Flow

1. User submits client and project details.
2. RetrievalService retrieves old proposal patterns, company profile content, portfolio context, and relevant prompt templates.
3. ProposalComposer builds a section-by-section prompt.
4. AI model generates a structured proposal draft.
5. System flags unsupported details as `NEEDS_INPUT`.
6. User reviews the draft and exports it to DOCX or print-friendly PDF.

## 6. Storage Design

For local MVP:

```text
data/
  source-pdfs/
    internal PDF/XLSX files
  processed/
    documents.json
    extracted-text/
    chunks.json
    embeddings.json
    proposals/
```

`data/processed/` should not be treated as public static content. If processed content includes internal text, it should be excluded from public repositories unless approved.

For deployment:

- Keep raw documents out of the public app bundle.
- Use Supabase tables for document metadata, chunks, embeddings, and generated proposal drafts if persistence is required.
- Use environment variables for API keys.

## 7. Security and Privacy

- Never expose API keys in browser code.
- Never place raw internal PDFs under `public/`.
- Do not commit source PDFs or extracted internal text to a public repository without approval.
- Use server-side API routes for model and embedding calls.
- Add an optional simple admin password or demo guard only if public access is needed.

## 8. Error Handling

The system should handle:

- Missing API key.
- Empty source folder.
- PDF extraction failure.
- Embedding generation failure.
- No retrieval matches.
- Model response error.
- DOCX export failure.

For each case, the UI should provide a clear message and a suggested next action.

## 9. Testing Strategy

Initial tests should focus on:

- Data source discovery.
- XLSX prompt-library parsing.
- Chunking output shape.
- Retrieval behavior with a small fixture.
- Prompt template selection.
- Proposal section assembly with `NEEDS_INPUT`.
- API route validation.
- Export generation smoke test.

End-to-end tests should cover:

- Chat answer with sources.
- Proposal generation and preview.
- Admin ingestion status display.

## 10. Technical Decisions

- Use RAG instead of fine-tuning.
- Start with local JSON storage before Supabase.
- Use Gemini only through server-side code.
- Use print-friendly HTML for PDF export in the MVP.
- Keep authentication out of scope unless public deployment requires a basic guard.

## 11. Open Technical Questions

- Which Gemini model and embedding model will be used after API access is confirmed?
- Are the large portfolio PDFs text-readable or do they require OCR?
- Should generated proposal drafts be persisted locally, in Supabase, or only in browser state for the demo?
- Should page-level PDF citations be implemented in the MVP or deferred until reliable parsing is confirmed?
