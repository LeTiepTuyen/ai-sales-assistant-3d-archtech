# Deployment Plan

Project: AI Sales Assistant for 3D Archtech  
Version: 1.0  
Date: 2026-06-05  
Status: Local demo prepared; public deployment not yet approved

## 1. Deployment Goal

The project should run locally first and only move to a public demo after source handling, environment variables, and cost controls are confirmed.

The public deployment should demonstrate the app interface and core flows without exposing internal source files or API keys.

## 2. Local-First Plan

Local development should be the default:

1. Build the Next.js MVP.
2. Store raw source files in `data/source-pdfs/`.
3. Store processed local outputs in `data/extracted/` and `data/chunks/`.
4. Configure environment variables in `.env.local`.
5. Run ingestion locally.
6. Test chat, proposal generation, admin data sources, and export.
7. Confirm the demo script works before deployment.

## 3. Environment Variables

Expected variables:

```text
GOOGLE_GENERATIVE_AI_API_KEY=NEEDS_INPUT
GEMINI_MODEL=gemini-3.5-flash
NEXT_PUBLIC_SUPABASE_URL=NEEDS_INPUT
NEXT_PUBLIC_SUPABASE_ANON_KEY=NEEDS_INPUT
SUPABASE_SERVICE_ROLE_KEY=NEEDS_INPUT
ADMIN_DEMO_PASSWORD=NEEDS_INPUT
NEXT_PUBLIC_APP_NAME=AI Sales Assistant for 3D Archtech
```

Supabase variables are only required if the deployed demo uses Supabase persistence. The Gemini key is optional for the local demo because the app has a local fallback mode. Real API keys must be stored in `.env.local` or deployment secrets, not in `.env.example`. The app reads `GOOGLE_GENERATIVE_AI_API_KEY` first, then `GEMINI_API_KEY` or `GOOGLE_API_KEY` for compatibility with Gemini API documentation.

## 4. Public Demo Options

### Option A: Local Demo Only

Use when the course presentation can run from the presenter's machine.

Advantages:

- Lowest cost.
- Internal files remain local.
- Simple to control.

Limitations:

- Not accessible to external evaluators after the presentation.

### Option B: Vercel App with Local Demo Data

Use when the public demo only needs UI and controlled sample data.

Advantages:

- Simple deployment path for Next.js.
- Good for showing the interface.

Limitations:

- Raw internal PDFs should not be deployed.
- Live RAG over internal documents may not persist unless processed data is safely included or a database is configured.
- Extracted/chunk JSON can contain internal text and must not be included in public assets without approval.

### Option C: Vercel App with Supabase pgvector

Use when the public demo needs persistent retrieval.

Advantages:

- Supports deployed retrieval and document metadata.
- Good fit for low-cost vector search.

Limitations:

- Requires Supabase setup and careful access control.
- Internal text may be stored in a managed service and must be approved.

Recommended path:

Start with Option A. Move to Option C only if public deployed RAG is required and internal data handling is approved.

## 5. Deployment Architecture

```text
Browser
  -> Vercel-hosted Next.js app
  -> Server API routes
  -> Gemini API for generation and embeddings
  -> Supabase Postgres/pgvector if enabled
```

Raw files should remain outside public static hosting. If a deployed demo needs document data, store processed chunks in Supabase only after approval. For local-only demo, server-side retrieval reads `data/chunks/retrieval-index.json`.

## 6. Build and Release Steps

1. Complete local MVP.
2. Confirm `.gitignore` excludes local secrets and internal raw data.
3. Run local ingestion.
4. Run local test suite.
5. Run `npm run smoke` for the main local flows.
6. Confirm no secrets are in client-side code.
7. Confirm no raw internal PDFs are under `public/`.
8. Configure Vercel environment variables.
9. Configure Supabase only if approved.
10. Deploy to Vercel.
11. Run post-deployment smoke test.
12. Update demo script with the final URL if public deployment is used.

## 7. Data Handling for Deployment

Rules:

- Do not deploy `data/source-pdfs/` as public assets.
- Do not commit source PDFs to a public repository unless approved.
- Do not deploy extracted/chunk JSON publicly unless internal data handling is approved.
- Do not commit `.env.local`.
- Do not expose service-role database keys in browser code.
- If processed chunks contain internal text, treat them as internal materials.

## 8. Cost Controls

- Use free or low-cost tiers where possible.
- Avoid fine-tuning.
- Cache ingestion outputs.
- Avoid re-embedding unchanged files.
- Limit demo document ingestion to required sources if API quota is constrained.

## 9. Rollback Plan

If public deployment fails:

- Use local demo mode.
- Use pre-generated sample outputs clearly labeled as demo samples.
- Present architecture and local app walkthrough.
- Defer Supabase deployment until credentials and data approval are ready.

## 10. Deployment Acceptance Criteria

For local demo:

- App runs locally.
- Ingestion completes or shows clear warnings.
- Chat and proposal generation work.
- Export works.
- Demo script can be completed.

For public demo:

- App loads from Vercel URL.
- API routes work with configured server-side secrets.
- No raw internal files are publicly accessible.
- RAG data access is approved and controlled.
- Main demo scenarios pass smoke testing.

## 11. Open Questions

- Is public deployment required for course grading or is local demo enough?
- Can internal source documents or extracted text be stored in Supabase?
- Which model provider and budget limits are approved?
- Should the public demo include an admin password?
