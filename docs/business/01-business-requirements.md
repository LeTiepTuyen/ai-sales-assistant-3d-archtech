# Business Requirements Document

Project: AI Sales Assistant for 3D Archtech  
Version: 1.0  
Date: 2026-06-05  
Status: Planning baseline before coding

## 1. Source Basis

This document is grounded in the following project materials:

- `AGENTS.md`
- `README.md`
- `docs/00-start-here.md`
- `docs/01-rough-idea-vi.md`
- `docs/02-project-brief-en.md`
- `docs/03-data-inventory.md`
- `data/source-pdfs/[3D Archtech] Prompts for AI sales assistant.xlsx`
- `data/source-pdfs/[3D Archtech] Prompts for AI sales assistant - Prompt cho sales (Eng).pdf`
- Source PDF portfolio, company profile, and proposal files listed in `docs/03-data-inventory.md`

Detailed company claims, service descriptions, project outcomes, client results, and case-study facts must be retrieved from the source files during ingestion. Where those facts are not yet extracted, this document uses `NEEDS_INPUT`.

## 2. Business Background

3D Archtech has internal sales materials such as previous proposals, company profile content, portfolio documents, and a sales prompt library. The project aims to turn these materials into a local-first demo AI Sales Assistant that helps sales users answer client questions, explain technical services in business-friendly language, and generate proposal drafts from reusable proposal patterns.

The project is intended for a university business course demo. It should show practical business value without becoming an enterprise-grade sales platform.

## 3. Business Problem

Sales teams often need to quickly reuse internal knowledge when responding to clients. The available information may be spread across proposals, portfolio PDFs, company profile materials, and prompt templates. Without a searchable assistant, sales users may spend unnecessary time finding the right examples, translating technical language, or assembling proposal drafts.

The business problem is to demonstrate how a focused AI assistant can reduce manual preparation effort and improve consistency in sales communication while remaining source-aware and maintainable.

## 4. Business Objectives

The demo must support the following objectives:

1. Help sales users retrieve relevant information from internal company materials.
2. Translate technical concepts into clear business language for client-facing communication.
3. Generate structured proposal drafts using old proposal templates, source materials, and client input.
4. Display source references so users can verify which internal materials informed an answer.
5. Provide a simple admin workflow for adding or re-ingesting source documents.
6. Support local demonstration first, with a low-cost path to public deployment.

## 5. Target Users

Primary users:

- Sales team members preparing client responses and proposals.
- Business development staff exploring suitable service positioning.

Secondary users:

- University evaluators reviewing the business demo.
- Project maintainers who ingest documents and configure the knowledge base.

## 6. Main Demo Use Cases

### 6.1 Automatic Proposal Generation

Sales users enter client context such as industry, pain points, business goals, proposed services, project size, timeline, budget if available, and preferred old proposal style. The assistant retrieves relevant proposal patterns, portfolio materials, and case-study references, then generates a proposal draft.

Expected proposal sections are grounded in the sales prompt library:

- Cover Page
- Company and Team Overview
- Project Overview
- Challenge vs. Solution Table
- Detailed Features
- Implementation Process
- Scope of Application
- Expected Results

If the source files do not contain enough company, team, case-study, pricing, or timeline detail, the assistant must mark those parts as `NEEDS_INPUT` rather than fabricating them.

### 6.2 Knowledge-Base Q&A and Business-Friendly Explanation

Sales users ask questions about services, technical terms, portfolios, or relevant examples. The assistant retrieves matching internal materials and answers in a concise business-oriented style.

Supported examples include:

- Explaining a technical term in practical business language.
- Recommending relevant service categories based on a client need.
- Summarizing source-backed information from portfolio or proposal files.
- Identifying missing information required before a customer-facing answer can be finalized.

## 7. MVP Scope

The MVP is a moderate-scope demo and should include:

1. Professional chatbox interface.
2. Knowledge-base Q&A over ingested source PDFs/XLSX.
3. Business-friendly technical term explanation.
4. Proposal generator form, preview, and export.
5. Admin data source page for viewing, uploading, and re-ingesting documents.
6. Source-aware answers with document names and chunk references.
7. DOCX export for generated proposals.
8. Print-friendly PDF workflow.
9. Demo script and sample prompts.
10. Local-first operation with a clear deployment plan.

## 8. Out of Scope

The MVP should not include:

- Fine-tuning or training a custom model.
- Enterprise CRM integration.
- Multi-tenant account management.
- Complex authentication beyond an optional basic demo/admin guard.
- Paid infrastructure unless explicitly approved.
- Public exposure of internal source PDFs.
- Unsupported claims about client outcomes, company capabilities, metrics, or pricing.

## 9. Business Requirements

| ID | Requirement | Priority |
|---|---|---|
| BR-01 | The assistant shall answer sales questions using only ingested source materials and user-provided context. | Must |
| BR-02 | The assistant shall generate proposal drafts from client input, old proposal patterns, and retrieved source context. | Must |
| BR-03 | The assistant shall clearly mark missing or unverifiable details as `NEEDS_INPUT`. | Must |
| BR-04 | The assistant shall show source references for knowledge answers and proposal sections where applicable. | Must |
| BR-05 | The assistant shall translate technical concepts into business value language suitable for non-technical stakeholders. | Must |
| BR-06 | The admin workflow shall let maintainers inspect available data sources and trigger re-ingestion. | Should |
| BR-07 | Generated proposals shall be exportable as DOCX and available in a print-friendly view. | Should |
| BR-08 | The application shall be demonstrable locally before any public deployment. | Must |

## 10. Acceptance Criteria

The planning and MVP work can be accepted when:

- A sales user can ask a knowledge-base question and receive an answer with source references or `NEEDS_INPUT`.
- A sales user can enter client information and receive a structured proposal draft.
- Proposal sections do not invent company facts, case-study results, pricing, or delivery timelines.
- The admin page lists available source documents and shows ingestion status.
- The system can re-ingest local PDFs/XLSX files into a searchable knowledge base.
- Generated proposals can be exported to DOCX and viewed in a print-friendly layout.
- The demo script covers both main use cases end to end.

## 11. Risks and Constraints

| Risk or Constraint | Impact | Mitigation |
|---|---|---|
| PDF files may contain image-heavy or low-quality text. | Retrieval quality may be inconsistent. | Validate extraction output and mark low-confidence documents for manual review or OCR later. |
| Source documents may lack pricing, delivery timeline, or company team details. | Proposal drafts may be incomplete. | Use `NEEDS_INPUT` placeholders and required input fields. |
| Gemini API or embedding usage may require keys and quota. | Demo may fail if credentials are missing. | Provide local JSON fallback and environment variable checks. |
| Internal source documents may be confidential. | Public deployment risk. | Exclude raw source files from public Git and deployed static assets. |
| The project scope may expand beyond a course demo. | Delivery risk. | Keep MVP focused on two core demo use cases. |

## 12. Required Inputs Before Final Demo

- Confirm whether internal source PDFs/XLSX may be used in the public demo environment.
- Confirm preferred proposal branding and visual style.
- Provide any required company facts that are not extractable from source documents.
- Confirm whether an API key for Gemini or another model provider is available.
- Confirm whether deployment will use Supabase or local JSON only.
