# Public Deployment Plan

Project: AI Sales Assistant for 3D Archtech  
Version: 2.0  
Date: 2026-06-06  
Status: Approved target path for a public classroom demo using Vercel + Supabase pgvector on free tiers

## 1. Deployment Decision

The selected deployment option is:

```text
Vercel Hobby
  + Next.js App Router frontend and API routes
  + Google Gemini API Free Tier for generation and embeddings when quota allows
  + Supabase Free Plan Postgres with pgvector for deployed RAG retrieval
```

This is the best fit for a short university demo because it gives the class a public URL, keeps the Next.js app on a platform designed for this stack, and provides persistent retrieval data without running a custom server.

This plan is not a production launch plan. It is a controlled public demo plan for approximately 1-5 classroom users.

## 2. Cost Target

Target cost: `USD 0`.

The deployment must remain free by following these constraints:

- Use a personal/non-commercial Vercel Hobby project.
- Use the default `*.vercel.app` domain, not a purchased custom domain.
- Use a Supabase Free Plan organization/project with no paid add-ons.
- Do not enable Supabase Pro, branching, read replicas, PITR, custom domains, log drains, IPv4 add-ons, or upgraded compute.
- Use Gemini Free Tier only. Do not link or use a paid Gemini billing project unless explicitly approved.
- Keep the classroom dataset within free-tier limits and upload the full approved processed chunk set needed to reproduce the local demo experience, not raw PDFs/XLSX.
- Avoid load testing, public sharing beyond the class, bots, or open-ended usage after the demo.

Free-tier references checked on 2026-06-06:

- Vercel Hobby is free for personal projects and small-scale applications, with included function and compute usage: `https://vercel.com/docs/plans/hobby`
- Vercel pricing lists Hobby included compute/function quotas: `https://vercel.com/pricing`
- Supabase Free Plan includes two free projects and free quotas such as 500 MB database size per project and 5 GB egress: `https://supabase.com/docs/guides/platform/billing-on-supabase`
- Supabase says Free Plan usage is not charged; when quota is exceeded, usage is restricted rather than billed: `https://supabase.com/docs/guides/platform/cost-control#spend-cap`
- Gemini API Free Tier provides limited free access for small projects: `https://ai.google.dev/gemini-api/docs/pricing`
- Gemini billing tiers start on Free Tier for new accounts, subject to model-specific free rate limits: `https://ai.google.dev/gemini-api/docs/billing/`

## 3. Current Fit Assessment

The selected architecture is appropriate, but the current codebase is not yet fully deployed-RAG ready.

Already prepared:

- Next.js app routes and API routes exist.
- Gemini generation is server-side and optional.
- Local lexical retrieval works from `data/chunks/retrieval-index.json`.
- Supabase pgvector schema exists at `docs/technical/supabase-pgvector-schema.sql`.
- RLS is enabled in the prepared schema.
- `match_rag_chunks(...)` RPC is prepared for server-side vector retrieval.
- `.gitignore` excludes `.env.local`, raw source files, extracted text, and local chunks.

Still required before public Vercel + Supabase pgvector deployment:

- Add `@supabase/supabase-js` as an application dependency.
- Add a server-only Supabase client utility.
- Add an embedding provider behind a server-side API key.
- Add a deployed ingestion path that writes the full approved local demo metadata, chunks, and embeddings to Supabase.
- Add a retrieval mode that calls `match_rag_chunks(...)` from server-side API routes.
- Keep local JSON retrieval as a fallback.
- Add a smoke test that confirms deployed chat/proposal routes can retrieve Supabase-backed sources.
- Re-run security checks to confirm no raw internal files or secrets are deployed.

Therefore, the plan is optimized for the target, but it is not "configuration only." It requires a small backend integration work package before deployment.

## 4. Deployment Architecture

```text
Classroom user browser
  -> Vercel public URL
  -> Next.js App Router pages
  -> Next.js server API routes
      -> Gemini API for response generation
      -> Gemini embedding model for query/document embeddings when configured
      -> Supabase Postgres + pgvector for approved RAG chunks
  -> DOCX export API route
  -> Print-friendly HTML for PDF-style export
```

Important boundary:

- Browser code may receive only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Browser code must never receive `SUPABASE_SERVICE_ROLE_KEY`, Gemini keys, raw source files, extracted text dumps, or full internal chunk indexes.
- Supabase RAG tables should not have public read policies for the MVP demo.
- Retrieval should go through trusted server-side code.

## 5. Environment Variables

Configure these locally in `.env.local` and in Vercel Project Settings for `Production` and `Preview` if needed:

```env
GOOGLE_GENERATIVE_AI_API_KEY=<server-side Gemini key>
GEMINI_MODEL=gemini-3.5-flash
GEMINI_EMBEDDING_MODEL=<approved embedding model>
GEMINI_MAX_OUTPUT_TOKENS=8192

NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable-or-legacy-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<secret-or-legacy-service-role-key>

ADMIN_DEMO_PASSWORD=<simple demo password if admin guard is implemented>
NEXT_PUBLIC_APP_NAME=AI Sales Assistant for 3D Archtech
RAG_BACKEND=supabase
```

Notes:

- `GOOGLE_GENERATIVE_AI_API_KEY`, `GEMINI_EMBEDDING_MODEL`, `GEMINI_MAX_OUTPUT_TOKENS`, `SUPABASE_SERVICE_ROLE_KEY`, and `ADMIN_DEMO_PASSWORD` are server-side settings.
- `NEXT_PUBLIC_*` variables are browser-visible by design.
- `RAG_BACKEND=supabase` should select deployed Supabase retrieval after the code path exists.
- If Gemini fails or quota is exhausted during the demo, the app should fall back to local/demo-safe responses and clearly avoid unsupported claims.

## 6. Data Handling Policy

Allowed for public demo:

- Approved document metadata.
- The full approved processed text chunk set needed for the local-equivalent public demo.
- Embeddings generated from approved processed chunks.
- Demo-safe uploaded client briefs used during the class session.
- Generated proposal drafts in browser state or server responses.

Not allowed unless explicitly approved:

- Raw files from `data/source-pdfs/`.
- Full `data/extracted/` dumps.
- Full `data/chunks/` JSON files copied into public assets.
- Real API keys in Git, screenshots, docs, browser code, or chat messages.
- Confidential client details, unapproved pricing, private implementation metrics, or unsupported case-study claims.

Approved chunk scope:

The user has approved uploading all processed chunks required for the public classroom demo so the deployed AI Chat can behave as closely as possible to the local demo. The upload target is the final generated local retrieval index, currently represented by `data/chunks/retrieval-index.json` after `npm run ingest`.

Current known local ingestion baseline:

- 12 source documents
- 205 chunks
- 0 extraction failures

This approval does not include raw PDFs/XLSX, `.env.local`, API keys, or unprocessed extracted dumps.

Sanitization rule:

Before uploading chunks to Supabase, perform a quick final review for clearly sensitive content. If a source contains sensitive material but is still useful for the demo, exclude only the problematic chunks through an explicit denylist and document that exclusion. Otherwise, upload the full approved local demo chunk set so public retrieval has source coverage close to local retrieval.

## 7. Implementation Work Packages

### Work Package A: Preflight and Free-Tier Gates

1. Confirm the demo is non-commercial and short-lived.
2. Confirm the Supabase project is on Free Plan.
3. Confirm Vercel is using Hobby, not Pro.
4. Confirm Gemini key is Free Tier or explicitly approved.
5. Confirm no custom domain or paid add-on is enabled.
6. Confirm raw source files remain ignored by Git.
7. Confirm the full local demo processed chunk set is approved for Supabase upload, except any explicitly denied chunks.

Exit criteria:

- Written approval exists in project notes or `docs/decisions.md`.
- The deployer can explain the free-tier constraints before deployment.

### Work Package B: Supabase Project and Schema

1. Create the Supabase Free project.
2. Prefer a nearby region such as Singapore for Vietnam/Thailand classroom use if available.
3. Enable `vector` extension through SQL migration or dashboard.
4. Create a migration from `docs/technical/supabase-pgvector-schema.sql`.
5. Apply the migration.
6. Confirm `rag_documents`, `rag_chunks`, and `match_rag_chunks(...)` exist.
7. Confirm RLS is enabled.
8. Confirm no anon/authenticated public read policies exist.
9. Confirm only `service_role` can execute the private match RPC.

Use `docs/technical/08-supabase-deployment-setup-guide.md` for detailed Supabase steps.

### Work Package C: Application Integration

1. Add `@supabase/supabase-js`.
2. Add `lib/supabase/server.ts` or equivalent server-only client.
3. Add an embedding service that uses the selected Gemini embedding model.
4. Add an ingestion script or admin API that:
   - reads the full approved local demo chunk set,
   - generates embeddings,
   - upserts `rag_documents`,
   - upserts `rag_chunks`,
   - skips unchanged chunks where possible.
5. Add a retrieval service that:
   - generates a query embedding,
   - calls `match_rag_chunks(...)`,
   - maps rows into the existing citation DTO shape,
   - falls back to local lexical retrieval if Supabase is unavailable.
6. Wire chat and proposal services to use the Supabase retrieval path when `RAG_BACKEND=supabase`.

Exit criteria:

- Local API routes can retrieve from Supabase with a server-side key.
- Browser bundles do not contain `SUPABASE_SERVICE_ROLE_KEY` or Gemini keys.

### Work Package D: Vercel Project Setup

Recommended path: Git integration for simplicity.

1. Import the GitHub repository into Vercel.
2. Confirm framework detection is `Next.js`.
3. Confirm build command is `npm run build`.
4. Confirm install command is Vercel default for npm.
5. Confirm output directory remains Next.js default.
6. Add the environment variables from Section 5.
7. Deploy a Preview deployment first.
8. Run smoke tests against the Preview URL.
9. Promote or deploy to Production only after smoke tests pass.

CLI alternative:

```powershell
vercel
vercel --prod
vercel inspect <deployment-url>
vercel logs <deployment-url>
```

### Work Package E: Verification

Run local checks before public deployment:

```powershell
npm run typecheck
npm run lint
npm run build
npm run smoke
```

Run deployed smoke tests:

1. Open the Vercel URL.
2. Confirm `/`, `/chat`, `/prompts`, `/proposal`, `/admin/data-sources`, and print/export routes load.
3. Ask a source-grounded manufacturing question in `/chat`.
4. Confirm the answer cites Supabase-backed source chunks.
5. Generate a proposal using the demo manufacturing prompt.
6. Confirm DOCX export works.
7. Confirm print-friendly preview works.
8. Confirm no source PDF URL is publicly accessible.
9. Confirm Vercel logs show no repeated 500 errors.
10. Confirm Supabase logs show expected low query volume only.

### Work Package F: Post-Demo Shutdown

After the class demo:

1. Rotate the Gemini key if it was displayed, shared, or used from an untrusted machine.
2. Disable or remove the Vercel production deployment if public access is no longer needed.
3. Delete Supabase demo chunks if they contain internal text and no longer need to remain online.
4. Keep the schema/migration files in Git, but do not commit secrets or raw source materials.
5. Record final demo URL, status, and any failures in `docs/progress.md`.

## 8. Free-Tier Risk Register

| Risk | Impact | Mitigation |
|---|---|---|
| Vercel Hobby quota exceeded | Public demo may throttle or pause specific features until reset. | Keep usage to class demo only; do not share widely. |
| Supabase Free quota exceeded | Supabase may restrict usage. | Upload only processed text chunks needed for local-equivalent demo coverage; avoid storage buckets, raw files, and load tests. |
| Supabase Free project pauses after inactivity | Demo may need manual restore later. | Open the dashboard and test the project before demo day. |
| Gemini Free Tier rate limit hit | AI responses may fail or fall back. | Keep prompts short, test shortly before class, preserve local fallback behavior. |
| Sensitive text uploaded to Supabase | Internal information could be exposed through server responses. | Review and sanitize chunk set before upload; keep RLS closed to anon/authenticated roles. |
| Service role key leaks | Full database access risk. | Store only in Vercel server env vars; rotate immediately if exposed. |
| Raw files committed or deployed | Confidentiality risk. | Keep `.gitignore`; never place source PDFs/XLSX under `public/`. |

## 9. Rollback Plan

If Vercel deployment fails:

- Use the local demo.
- Share screenshots or a recorded walkthrough.
- Keep Supabase project untouched until the app build is stable.

If Supabase retrieval fails:

- Set `RAG_BACKEND=local` or use the existing fallback mode.
- Continue the classroom demo with local/demo-safe responses.
- Explain that Supabase pgvector is the intended persistent RAG backend and show the schema/architecture.

If Gemini quota or API access fails:

- Use local fallback responses.
- Use pre-generated demo outputs clearly labeled as samples.
- Do not improvise unsupported company claims.

If sensitive data is accidentally deployed:

- Remove the Vercel deployment or environment variables immediately.
- Delete affected Supabase rows.
- Rotate `SUPABASE_SERVICE_ROLE_KEY` and Gemini keys.
- Record the incident in `docs/progress.md`.

## 10. Acceptance Criteria

The deployment is accepted only when:

- The app is publicly reachable from a Vercel URL.
- The project remains on Vercel Hobby.
- Supabase remains on Free Plan with no paid add-ons.
- Gemini usage remains Free Tier or explicitly approved.
- API routes work with server-side secrets.
- Supabase-backed retrieval works for the main classroom demo scenarios with coverage close to local retrieval.
- Source citations appear in chat/proposal outputs.
- No raw source files are publicly accessible.
- No service-role key or Gemini key appears in browser code, logs, Git, screenshots, or docs.
- Main demo cases in `docs/demo/08-demo-cases-runbook.md` pass.
- A rollback path is ready before the class demo starts.

## 11. Codex Deployment Instructions

When a future Codex session performs the deployment:

1. Read this file first.
2. Read `docs/technical/08-supabase-deployment-setup-guide.md`.
3. Read `docs/technical/supabase-pgvector-schema.sql`.
4. Read `.env.example` and `.gitignore`.
5. Use the Vercel plugin/tooling for Vercel project setup, environment variables, deployment inspection, logs, and promotion.
6. Use the Supabase plugin/tooling for Supabase project inspection, SQL/migration execution, advisors, and log checks.
7. Do not enable paid plans, paid add-ons, custom domains, or paid Gemini billing without explicit user approval.
8. Do not upload raw internal files.
9. Update `docs/tasks.md`, `docs/progress.md`, and `docs/decisions.md` after the deployment work package.
