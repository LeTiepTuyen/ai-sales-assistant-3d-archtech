# Supabase Deployment Setup Guide

Project: AI Sales Assistant for 3D Archtech  
Date: 2026-06-06  
Status: Preparation guide for future deployment; public deployment still requires approval

## 1. Goal

This guide prepares Supabase for a future deployed RAG demo. The current app remains local-first and continues to work without Supabase. Supabase should only store processed document metadata, chunks, embeddings, and optional generated proposal records after internal-data handling is approved.

Do not upload raw files from `data/source-pdfs/` to Supabase unless explicitly approved.

## 2. What Supabase Will Store Later

The prepared schema in `docs/technical/supabase-pgvector-schema.sql` creates:

- `rag_documents`: source document metadata and ingestion status.
- `rag_chunks`: extracted text chunks, source metadata, and embeddings.
- `match_rag_chunks(...)`: server-side vector similarity RPC for deployed retrieval.

The schema enables Row Level Security on the RAG tables and does not create public read policies. The intended MVP access path is server-side only through a Supabase secret/service-role key.

## 3. Create the Supabase Project

1. Go to `https://supabase.com/dashboard`.
2. Create or select an organization.
3. Click `New project`.
4. Suggested project name: `ai-sales-assistant-3darchtech-demo`.
5. Choose the free plan unless the demo needs paid storage, backups, or branching.
6. Choose the nearest suitable region for the course demo. For Vietnam/Thailand demo use, Singapore is usually a practical default if available.
7. Generate a strong database password and store it in a password manager.
8. Wait until the project status is ready.

Record these values privately:

```text
SUPABASE_PROJECT_REF=
SUPABASE_DB_PASSWORD=
```

Do not put these two values in `.env.local` unless a future script explicitly needs them.

## 4. Fill Environment Variables

Open `.env.local` and fill only the Supabase block:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable-or-legacy-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<secret-or-legacy-service-role-key>
```

Where to find them:

1. Open the Supabase project dashboard.
2. Go to `Project Settings` > `API`.
3. Copy the Project URL into `NEXT_PUBLIC_SUPABASE_URL`.
4. Prefer a `sb_publishable_...` key for `NEXT_PUBLIC_SUPABASE_ANON_KEY`. If the project only exposes legacy keys in your view, use the legacy `anon` key.
5. Prefer a `sb_secret_...` key for `SUPABASE_SERVICE_ROLE_KEY`. If the project only exposes legacy keys in your view, use the legacy `service_role` key.

Security rule:

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` can be exposed to the browser.
- `SUPABASE_SERVICE_ROLE_KEY` must never be exposed in browser code, screenshots, public docs, Git, or client bundles.

## 5. Enable pgvector

The prepared SQL migration includes:

```sql
create schema if not exists extensions;
create extension if not exists vector with schema extensions;
```

You can also verify this manually in the Supabase dashboard:

1. Open `Database`.
2. Open `Extensions`.
3. Search for `vector`.
4. Confirm the extension is enabled.

## 6. Install Supabase CLI Later

The current machine does not have the `supabase` command installed. Supabase's current local-development docs support using the CLI through `npx` or as a local dev dependency.

Recommended project-local setup when you are ready:

```powershell
npm install supabase --save-dev
npx supabase --help
```

If you want local Supabase services, install Docker Desktop first, then run:

```powershell
npx supabase init
npx supabase start
```

For this project, local Supabase services are optional because the current demo uses local JSON retrieval.

## 7. Create the Migration File

When the CLI is installed, create the migration file through the CLI rather than hand-naming it:

```powershell
npx supabase migration new create_rag_pgvector_schema
```

Then copy the full contents of:

```text
docs/technical/supabase-pgvector-schema.sql
```

into the newly created file under:

```text
supabase/migrations/<timestamp>_create_rag_pgvector_schema.sql
```

This keeps the project aligned with Supabase migration history.

## 8. Link the Local Repo to the Remote Project

After the Supabase project exists:

```powershell
npx supabase login
npx supabase link --project-ref <project-ref>
```

Use the project ref from the Supabase dashboard URL or project settings.

## 9. Test Before Applying Remotely

If Docker/local Supabase is available:

```powershell
npx supabase db reset
```

If you are only preparing a remote project, do a dry run first:

```powershell
npx supabase db push --dry-run
```

Then apply:

```powershell
npx supabase db push
```

After pushing, verify:

```powershell
npx supabase migration list
```

In the Supabase dashboard, check that:

- `rag_documents` exists.
- `rag_chunks` exists.
- `match_rag_chunks` exists under database functions.
- RLS is enabled on both RAG tables.
- No public table policies were added.

## 10. Deployment Environment Variables

When deploying to Vercel later, add these as environment variables in Vercel Project Settings:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable-or-legacy-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<secret-or-legacy-service-role-key>
```

Keep `SUPABASE_SERVICE_ROLE_KEY` server-side only. Do not prefix it with `NEXT_PUBLIC_`.

## 11. Data Upload Gate

Before sending any processed document chunks to Supabase, confirm:

1. Public deployment is required.
2. Internal documents or extracted text are approved for managed cloud storage.
3. The selected Supabase project and region are acceptable for the course/demo context.
4. The app uses server-side ingestion and server-side retrieval for private chunk text.
5. No raw source PDFs/XLSX are placed in `public/` or uploaded to public buckets.

## 12. Future Implementation Checklist

- Add a Supabase server client utility.
- Add ingestion mode that writes `rag_documents` and `rag_chunks`.
- Add embedding generation for the selected Gemini embedding model.
- Confirm the embedding dimension still matches `extensions.vector(768)` before loading data.
- Add retrieval mode that calls `match_rag_chunks(...)`.
- Keep local JSON retrieval as fallback.
- Add smoke tests for the Supabase-backed chat and proposal routes.

## 13. Current Status

- Supabase env placeholders exist in `.env.example` and `.env.local`.
- Supabase pgvector schema exists at `docs/technical/supabase-pgvector-schema.sql`.
- Supabase CLI is not installed on this machine yet.
- Remote Supabase project details have not been provided yet.
- No internal source data has been uploaded to Supabase.
