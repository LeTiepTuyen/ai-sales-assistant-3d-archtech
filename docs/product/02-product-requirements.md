# Product Requirements Document

Project: AI Sales Assistant for 3D Archtech  
Version: 1.0  
Date: 2026-06-05  
Status: Planning baseline before coding

## 1. Product Summary

The AI Sales Assistant is a local-first web application for a university business demo. It helps sales users retrieve information from internal 3D Archtech materials, explain technical topics in business-friendly language, and generate proposal drafts from previous proposal patterns and client input.

The product should feel like a practical sales workspace rather than a research prototype. It must remain moderate in scope, source-aware, and maintainable.

## 2. Goals

1. Provide a professional chat experience for sales Q&A.
2. Generate structured proposal drafts based on source materials and user inputs.
3. Explain technical terms in client-ready business language.
4. Allow maintainers to view and re-ingest data sources.
5. Export proposal content as DOCX and print-friendly PDF.
6. Demonstrate RAG-based AI behavior without custom model training.

## 3. Non-Goals

- Building a full CRM.
- Implementing complex user roles or multi-tenant access.
- Fine-tuning a custom model.
- Creating production-grade document management.
- Guaranteeing factual coverage beyond available source documents.
- Publishing internal PDFs unless explicitly approved.

## 4. Personas

### Sales User

Needs to prepare client-facing answers and proposal drafts quickly. The user may not be deeply technical and needs explanations that can be used in meetings or follow-up messages.

### Admin or Maintainer

Needs to confirm which source files are available, run ingestion, and identify extraction issues before a demo.

### Demo Evaluator

Needs to understand the business value, product flow, and practical feasibility of the assistant.

## 5. Core User Stories

| ID | User Story | Priority |
|---|---|---|
| US-01 | As a sales user, I want to ask questions about company services and receive source-aware answers. | Must |
| US-02 | As a sales user, I want technical terms explained in business language so I can communicate with non-technical clients. | Must |
| US-03 | As a sales user, I want to enter client context and generate a proposal draft. | Must |
| US-04 | As a sales user, I want proposal sections to show where supporting source information came from. | Must |
| US-05 | As a sales user, I want to export a proposal draft as DOCX. | Should |
| US-06 | As a sales user, I want a print-friendly proposal view for PDF export. | Should |
| US-07 | As an admin, I want to view available source documents and ingestion status. | Should |
| US-08 | As an admin, I want to upload or re-ingest documents for future updates. | Should |

## 6. Functional Requirements

### 6.1 Chatbox

- Accept natural language questions from the user.
- Route questions to knowledge-base Q&A, technical explanation, proposal support, or general sales prompt assistance.
- Retrieve relevant chunks from ingested documents.
- Display concise answers with source references.
- Show `NEEDS_INPUT` when facts are missing or unsupported.
- Provide loading, error, and empty states.

### 6.2 Proposal Generator

- Capture required client inputs:
  - Client name
  - Industry
  - Pain points
  - Business goals
  - Proposed services
  - Project size or scope
  - Expected timeline
  - Budget if available
  - Preferred old proposal style or reference document
- Retrieve relevant old proposal sections, portfolio materials, and prompt templates.
- Generate a proposal draft with structured sections:
  - Cover Page
  - Company and Team Overview
  - Project Overview
  - Challenge vs. Solution Table
  - Detailed Features
  - Implementation Process
  - Scope of Application
  - Expected Results
  - Risks, Assumptions, and `NEEDS_INPUT`
- Let the user preview the proposal before export.
- Support DOCX export and print-friendly PDF output.

### 6.3 Admin Data Sources

- List source files found under `data/source-pdfs/`.
- Show file type, ingestion status, extracted text status, chunk count, and last ingestion time.
- Trigger ingestion or re-ingestion for selected documents.
- Highlight documents that require manual review because extraction failed or produced limited text.
- Keep raw internal files out of public static assets.

### 6.4 Source Citations

- Show source document names for retrieved context.
- Include chunk identifiers or section labels when available.
- Avoid unsupported citations.
- Make it clear when answer content comes from user input rather than source documents.

## 7. Prompt Library Coverage

The source prompt library supports the following assistant capabilities:

- Proposal generation from existing proposal templates.
- Target customer persona analysis.
- Product demo or sales pitch structure.
- Industry-specific technical term explanation.
- Competitor analysis and service positioning.
- Follow-up email or message drafting.
- Meeting-note action item extraction.
- Core customer needs analysis.
- Objection analysis.
- Suitable service recommendation.
- Early-stage customer barrier analysis.
- Innovation factor analysis.
- Customer need forecasting.
- Feature-to-benefit translation.
- Initial client brief to requirements analysis.

For the MVP, the first release should prioritize proposal generation, knowledge-base Q&A, technical explanation, and service recommendation. Other prompt-library use cases can be exposed later as examples or advanced templates.

## 8. Data Requirements

The product depends on:

- Prompt library XLSX/PDF.
- Company profile PDF.
- Old proposal PDFs.
- Portfolio PDFs for Digital Twin, AR, Visualization, IoT/Robotics, Games, and general portfolio material.

The product must not assume that every document is machine-readable. Extraction quality must be checked during ingestion.

## 9. MVP Acceptance Criteria

| Area | Acceptance Criteria |
|---|---|
| Chat | User can ask a question and receive a source-aware response. |
| Technical explanation | User can enter a term and receive a business-friendly explanation with sources when available. |
| Proposal | User can enter client context and generate a structured proposal draft. |
| Source handling | Unsupported facts are marked as `NEEDS_INPUT`. |
| Admin | User can see source files and ingestion status. |
| Export | Proposal can be exported as DOCX and viewed in print-friendly format. |
| Demo | Script covers both core use cases without requiring paid enterprise systems. |

## 10. Product Risks

| Risk | Product Response |
|---|---|
| Source content is incomplete or extraction quality is low. | Show `NEEDS_INPUT`, extraction warnings, and manual review status. |
| Users expect the assistant to be fully autonomous. | Keep UI labels and output structure clear about draft status and source grounding. |
| Proposal generation becomes too broad. | Use a fixed section template for the MVP. |
| Public deployment exposes internal files. | Store raw files outside public assets and document deployment controls. |

## 11. Future Enhancements

- Additional prompt-library workflows.
- Editable proposal sections with regeneration per section.
- Better citation viewer with page numbers after reliable PDF parsing is implemented.
- Optional OCR for image-heavy PDFs.
- Optional Supabase vector store for public demo persistence.
- Basic admin password or demo guard if the app is exposed publicly.
