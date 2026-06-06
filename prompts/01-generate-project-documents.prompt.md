# Prompt 01 — Generate Project Documents

/local
/auto-context

You are the product architect and technical lead for a new demo project named “AI Sales Assistant for 3D Archtech”.

Task: analyze the project idea and source data inventory, then create complete project documents before coding.

Read first:
@AGENTS.md
@README.md
@docs/00-start-here.md
@docs/01-rough-idea-vi.md
@docs/02-project-brief-en.md
@docs/03-data-inventory.md
@data/source-pdfs/

Create or update these documents:
@docs/business/01-business-requirements.md
@docs/product/02-product-requirements.md
@docs/technical/03-technical-design.md
@docs/technical/04-rag-data-design.md
@docs/product/05-ui-ux-spec.md
@docs/demo/06-demo-script.md
@docs/technical/07-deployment-plan.md
@docs/tasks.md
@docs/progress.md
@docs/decisions.md

Requirements:
1. Rewrite the rough Vietnamese idea into a professional Business Requirements Document.
2. Define MVP scope for a university business demo.
3. Define two main demo use cases:
   - automatic proposal generation from old proposal templates and sales materials,
   - knowledge-base Q&A and business-friendly explanation of technical terms.
4. Propose the simplest suitable technical stack using mostly free technologies.
5. Decide whether real model training is needed or whether RAG is enough.
6. Define data ingestion flow: PDF/XLSX parsing, chunking, embedding, retrieval, source citation.
7. Define UI pages: chatbox, proposal generator, admin data sources, document preview/export.
8. Define acceptance criteria and demo script.
9. Define tasks and implementation phases.
10. Keep scope moderate and demo-focused.

Rules:
- Do not write application code yet.
- Do not invent company facts beyond provided files.
- If data is missing, mark it as NEEDS_INPUT.
- Keep all documents in clear professional English.
- Return files changed, recommended stack, MVP scope, risks, and next step before coding.
