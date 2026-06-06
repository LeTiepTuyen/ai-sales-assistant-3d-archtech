# RAG and Data Design Document

Project: AI Sales Assistant for 3D Archtech  
Version: 1.0  
Date: 2026-06-05  
Status: Planning baseline before coding

## 1. Purpose

This document defines how internal PDF/XLSX materials should be ingested, chunked, embedded, retrieved, and cited for the AI Sales Assistant MVP.

The system must not invent company facts. It should answer from retrieved source context, user-provided input, or explicitly mark missing information as `NEEDS_INPUT`.

## 2. Source Inventory

The expected source documents are:

| File | Type | Expected Use |
|---|---|---|
| `[3D Archtech] Prompts for AI sales assistant.xlsx` | Prompt library | Intent routing and output templates. |
| `[3D Archtech] Prompts for AI sales assistant - Prompt cho sales (Eng).pdf` | Prompt library | Sales use case templates. |
| `Company profile 3D Archtech.pdf` | Company profile | Company overview, mission, services, team, and general company information if extractable. |
| `FarmDiaries_Proposal_3DArchtech.pdf` | Proposal | Proposal style, proposal sections, and reusable proposal pattern. |
| `Knowlympic_Proposal.pdf` | Proposal | Proposal style, proposal sections, and reusable proposal pattern. |
| `WA_GRAB_Proposal.pdf` | Proposal | Proposal style, proposal sections, and reusable proposal pattern. |
| `Portfolio Digital Twin.pdf` | Portfolio | Digital Twin knowledge and examples if extractable. |
| `Portfolio AR.pdf` | Portfolio | AR/VR knowledge and examples if extractable. |
| `Portfolio Visualization.pdf` | Portfolio | Visualization knowledge and examples if extractable. |
| `Portfolio IOT, ROBOTICs.pdf` | Portfolio | IoT/Robotics knowledge and examples if extractable. |
| `Games Show Case.pdf` | Portfolio | Game project examples if extractable. |
| `PORTFOLIO.pdf` | Portfolio | General 3D project showcase if extractable. |

The XLSX and matching PDF prompt library have been inspected and include templates for proposal generation, customer persona analysis, sales pitch structure, technical-term explanation, competitor analysis, follow-up messages, meeting action items, service recommendation, positioning, and requirements analysis.

## 3. Data Principles

1. Source documents are internal materials and must not be exposed publicly without approval.
2. Raw source files should remain outside `public/`.
3. Generated answers must be grounded in retrieved chunks or user-provided inputs.
4. Unsupported claims must be marked as `NEEDS_INPUT`.
5. The system should store enough metadata to trace an answer back to source documents.
6. Extraction quality should be recorded because large PDFs may be image-heavy.

## 4. Ingestion Pipeline

```text
File discovery
  -> File metadata registry
  -> Text extraction
  -> Text normalization
  -> Chunking
  -> Embedding generation
  -> Vector/local index update
  -> Ingestion status report
```

### 4.1 File Discovery

The system scans `data/source-pdfs/` and records:

- File name
- File path
- File type
- File size
- Last modified timestamp
- Document category
- Ingestion status

Document category can be inferred from inventory mapping:

- Prompt library
- Company profile
- Proposal
- Portfolio

### 4.2 Text Extraction

PDF extraction:

- Extract text page by page when possible.
- Preserve page number metadata when the parser supports it.
- Mark documents with very low extracted text as `needs_review`.
- Defer OCR unless required after extraction validation.

XLSX extraction:

- Read worksheet names, rows, and columns.
- Preserve use case names and prompt templates.
- Convert rows into structured prompt-template records.

### 4.3 Text Normalization

Normalization should:

- Remove repeated whitespace.
- Preserve section headings when available.
- Preserve table-like prompt sections where useful.
- Keep source language as extracted.
- Avoid rewriting or summarizing during ingestion.

## 5. Chunking Strategy

Recommended MVP chunking:

- Chunk size: approximately 600 to 900 tokens or equivalent character-based fallback.
- Overlap: approximately 100 to 150 tokens or equivalent character-based fallback.
- Split by headings, page boundaries, and paragraph breaks where possible.
- Keep tables and prompt templates together when they are short enough.

Each chunk should include:

```json
{
  "chunkId": "document-slug-0001",
  "documentId": "document-slug",
  "documentName": "Company profile 3D Archtech.pdf",
  "category": "company_profile",
  "pageStart": 1,
  "pageEnd": 1,
  "sectionTitle": "NEEDS_INPUT if unavailable",
  "text": "Extracted source text",
  "tokenEstimate": 0,
  "createdAt": "2026-06-05T00:00:00.000Z"
}
```

If page or section data is unavailable, use `null` or `NEEDS_INPUT` rather than fabricating it.

## 6. Embedding Design

Preferred approach:

- Use Gemini embeddings if API access is approved and configured.
- Store vector embeddings per chunk.
- Use cosine similarity or database-native vector similarity.

Local fallback:

- Store chunks in JSON.
- Use simple keyword or lexical scoring for offline demonstration if embeddings are unavailable.
- Clearly label fallback retrieval quality as limited.

Supabase deployment:

- Use Postgres tables with pgvector for chunk embeddings.
- Store document metadata separately from chunk content.

## 7. Retrieval Strategy

Retrieval should combine:

- Intent-aware filtering by category.
- Vector similarity when embeddings are available.
- Keyword fallback for local demo.
- Optional reranking by document category and source relevance.

Suggested retrieval behavior:

| Intent | Preferred Sources |
|---|---|
| Proposal generation | Old proposal PDFs, company profile, relevant portfolio PDFs, prompt library. |
| Technical explanation | Portfolio PDFs, company profile, prompt library explanation template. |
| Service recommendation | Portfolio PDFs, company profile, prompt library service recommendation template. |
| Customer persona or objections | Prompt library plus user-provided client context. |
| General company question | Company profile and relevant portfolios. |

## 8. Source Citation Format

Answers should cite sources using a compact format:

```text
Sources:
- Company profile 3D Archtech.pdf, chunk company-profile-0003
- Portfolio Digital Twin.pdf, chunk portfolio-digital-twin-0012
```

If page numbers are available:

```text
- Portfolio AR.pdf, page 4, chunk portfolio-ar-0007
```

If a statement is based only on user input:

```text
Based on client input provided in this session.
```

If no supporting source is found:

```text
NEEDS_INPUT: No supporting source found in the current knowledge base.
```

## 9. Prompt Grounding Rules

The model prompt should instruct the assistant to:

- Use retrieved context as the factual basis.
- Use the user's client input only for the new client scenario.
- Avoid inventing client results, pricing, delivery timelines, team credentials, or case-study outcomes.
- Mark missing details as `NEEDS_INPUT`.
- Keep explanations business-friendly and concise.
- Include source references for factual claims.

## 10. Proposal Data Design

Generated proposal drafts should store:

```json
{
  "proposalId": "proposal-001",
  "clientInput": {
    "clientName": "",
    "industry": "",
    "painPoints": "",
    "businessGoals": "",
    "proposedServices": "",
    "timeline": "",
    "budget": ""
  },
  "sections": [
    {
      "id": "project-overview",
      "title": "Project Overview",
      "content": "",
      "sources": [],
      "needsInput": []
    }
  ],
  "createdAt": "2026-06-05T00:00:00.000Z",
  "updatedAt": "2026-06-05T00:00:00.000Z"
}
```

## 11. Quality Checks

During ingestion:

- Confirm file exists.
- Confirm extracted text length is not empty.
- Confirm chunks are created.
- Confirm prompt-library rows are parsed.
- Confirm embeddings exist when embedding mode is enabled.

During generation:

- Confirm retrieved source count.
- Confirm answer includes sources or `NEEDS_INPUT`.
- Confirm proposal sections follow the required template.
- Confirm unsupported factual claims are not presented as verified facts.

## 12. Known Risks

| Risk | Mitigation |
|---|---|
| Large PDFs may be image-heavy. | Add extraction status and manual review flag; defer OCR until needed. |
| Prompt templates may contain formatting issues. | Normalize prompt-library rows into structured templates. |
| Local fallback retrieval may be less accurate. | Use it only as fallback and prefer embeddings when API access exists. |
| Source files may contain confidential content. | Do not place raw or processed source text in public deployment assets. |
