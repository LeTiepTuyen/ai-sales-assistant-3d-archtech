# AI Sales Assistant for 3D Archtech

Local-first web demo for a source-aware AI Sales Assistant. The app helps sales users search internal materials, explain technical services in business language, and generate proposal drafts from client input and retrieved source context.

## Current Scope

- Next.js App Router web application.
- Local PDF/XLSX ingestion.
- Local JSON chunk index and lexical retrieval for source context.
- AI Chat Helper with source references, inline citations, attachment UI, and `NEEDS_INPUT` handling.
- AI Chat Helper with source references, inline citations, formatted Markdown responses, attachment UI, and `NEEDS_INPUT` handling.
- AI Sales Prompt Hub sourced from the internal prompt workbook.
- Proposal generator with preview, print-friendly view, and DOCX export.
- Chatbox can also read uploaded DOCX or text client briefs and use them as context for proposal-style responses.
- Server-side Gemini generation when `GOOGLE_GENERATIVE_AI_API_KEY` is configured, with local fallback only as a safety net.

This is a web application demo only. No native mobile app is included.

## Safety Rules

- Do not expose API keys in browser code.
- Do not commit `.env.local`.
- Do not publish raw files from `data/source-pdfs/` without approval.
- Treat `data/extracted/` and `data/chunks/` as internal derived data because they can contain source-document text.
- Generated proposals are drafts and require sales review before external use.

## Required Source Files

Place internal PDF/XLSX files under `data/source-pdfs/`:

- `[3D Archtech] Prompts for AI sales assistant.xlsx`
- `[3D Archtech] Prompts for AI sales assistant - Prompt cho sales (Eng).pdf`
- `Company profile 3D Archtech.pdf`
- `FarmDiaries_Proposal_3DArchtech.pdf`
- `Knowlympic_Proposal.pdf`
- `WA_GRAB_Proposal.pdf`
- `Portfolio Digital Twin.pdf`
- `Portfolio AR.pdf`
- `Portfolio Visualization.pdf`
- `Portfolio IOT, ROBOTICs.pdf`
- `Games Show Case.pdf`
- `PORTFOLIO.pdf`

## Environment Variables

Copy `.env.example` to `.env.local` when you are ready to configure keys.

```env
GOOGLE_GENERATIVE_AI_API_KEY=
GEMINI_MODEL=gemini-3.5-flash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_DEMO_PASSWORD=demo-admin-password
NEXT_PUBLIC_APP_NAME=AI Sales Assistant for 3D Archtech
```

Gemini is the primary generation path when `GOOGLE_GENERATIVE_AI_API_KEY` is configured. Without a valid key, or if the API request fails because of model/quota/network issues, the app uses local fallback responses so the demo remains runnable. The app also accepts `GEMINI_API_KEY` or `GOOGLE_API_KEY` as aliases, but `GOOGLE_GENERATIVE_AI_API_KEY` is the project convention. Real keys belong in `.env.local` or deployment secrets, never in `.env.example`.

If a key has been pasted into chat, screenshots, or source files, rotate it in Google AI Studio before using it for the demo.

## Local Setup

```bash
npm install
npm run ingest
npm run dev
```

Open:

```text
http://localhost:3000
```

## Local Verification

Run these checks:

```bash
npm run typecheck
npm run lint
npm run build
```

While the dev server is running, run:

```bash
npm run smoke
```

The smoke test verifies:

- Dashboard route
- AI Chat Helper route
- Prompt Hub route
- Proposal Generator route
- Admin Data Sources route
- Proposal Preview route
- Data source API
- Chat API with sources
- Proposal generation API
- DOCX export API

## Demo Flow

1. Open Dashboard.
2. Open AI Chat Helper and ask:

```text
Explain Digital Twin for a manufacturing client in business language.
```

3. Confirm the response shows intent, provider, formatted headings/bold/bullets, source references, and `NEEDS_INPUT`.
4. Upload a DOCX client brief, ask for a proposal draft, and confirm the answer uses the uploaded brief context.
5. Open Prompt Hub.
6. Search for a prompt, fill detected placeholder fields, and copy the compiled prompt.
7. Open Proposal Generator.
8. Click `Load Demo Scenario`.
9. Click `Generate Draft`.
10. Review generated proposal sections and source references.
11. Click `Preview` for the print-friendly page.
12. Click `DOCX` to download a Word document.
13. Open Admin Data Sources and explain ingestion status and `needs_review` warnings.

## Useful Commands

```bash
npm run ingest
npm run retrieve -- "Portfolio Digital Twin"
npm run smoke
npm run dev
npm run build
```

## Deployment Readiness

Do not deploy without explicit approval.

Recommended path:

1. Local demo first.
2. Vercel deployment only after confirming source-data safety.
3. Supabase pgvector only if deployed persistent RAG is required and approved.

Prepared deployment references:

- `docs/technical/07-deployment-plan.md`
- `docs/technical/08-supabase-deployment-setup-guide.md`
- `docs/technical/supabase-pgvector-schema.sql`
- `docs/demo/07-final-demo-checklist.md`
- `docs/demo/local-test-results.md`
