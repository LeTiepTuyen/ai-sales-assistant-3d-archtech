# AGENTS.md — Codex Project Instructions

Project: AI Sales Assistant for 3D Archtech

## Mission
Build a moderate-scope demo AI Sales Assistant for a university business course. The app should help sales users ask questions about internal company materials, explain technical services in business-friendly language, and generate proposal drafts from reusable proposal templates and client input.

## Working Principles
- Build local-first before public deployment.
- Keep the scope demo-focused, practical, and maintainable.
- Prefer free or low-cost technologies.
- Do not fine-tune or train a custom model unless there is a clear reason. Use RAG over company documents.
- Do not expose API keys in the browser or commit secrets.
- Treat files under `data/source-pdfs/` as internal materials. Do not commit them to a public repository unless explicitly approved.
- Always update `docs/tasks.md`, `docs/progress.md`, and `docs/decisions.md` after each work package.

## Suggested Stack
Codex may adjust after analysis, but default stack should be:
- Next.js App Router + TypeScript
- Tailwind CSS + shadcn/ui
- Vercel AI SDK
- Google Gemini API for generation/embedding if suitable
- Supabase Postgres + pgvector for deployed demo
- Local JSON fallback for local demo
- DOCX export via `docx`
- PDF export via print-friendly HTML or a lightweight PDF approach

## Required MVP
1. Professional chatbox UI for sales assistant interaction.
2. Knowledge-base Q&A over internal sales materials.
3. Business-friendly technical term explanations.
4. Proposal generator from client input and existing proposal patterns.
5. Admin Data Sources page to view/upload/re-ingest documents.
6. Source-aware answers showing which internal materials were used.
7. DOCX and PDF/print-friendly export for generated proposals.
8. Demo script and sample prompts.

## Guardrails
- Do not invent company facts; use only provided source PDFs/XLSX or mark NEEDS_INPUT.
- Do not over-engineer. This is a university demo, not an enterprise SaaS product.
- Do not implement authentication unless needed for a basic admin password/demo guard.
- Ask before using paid services.
- Commit after each stable milestone.
