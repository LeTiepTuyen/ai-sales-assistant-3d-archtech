# Supabase pgvector Deployment Setup Guide

Project: AI Sales Assistant for 3D Archtech  
Date: 2026-06-06  
Status: Approved setup guide for Vercel + Supabase pgvector public classroom demo, free-tier target

## 1. Goal

This guide prepares Supabase as the persistent RAG backend for the public classroom demo.

Supabase should store the full approved local demo processed document metadata, text chunks, and embeddings needed to make the public AI Chat behave as closely as possible to the local demo. Raw files from `data/source-pdfs/` must not be uploaded to Supabase unless explicitly approved.

The intended access path is:

```text
Next.js server API route
  -> Supabase service/secret key
  -> private RAG tables and match RPC
  -> source-aware response generation
```

Browser code must not query private RAG chunk text directly.

## 2. Current Repository State

Prepared:

- Schema file: `docs/technical/supabase-pgvector-schema.sql`
- Tables: `rag_documents`, `rag_chunks`
- RPC: `match_rag_chunks(...)`
- RLS: enabled on both RAG tables
- Public policies: intentionally absent
- Local fallback retrieval: `lib/rag/local-retrieval.ts`
- Local chunk output: `data/chunks/retrieval-index.json`, ignored by Git

Not yet implemented:

- Runtime `@supabase/supabase-js` dependency
- Server-only Supabase client
- Gemini embedding generation path
- Ingestion script that uploads the full approved local demo chunk set and embeddings
- Supabase retrieval service used by chat/proposal API routes
- Supabase-backed deployed smoke test

## 3. Free-Tier Rules

Use Supabase Free Plan only.

Do not enable:

- Pro Plan
- Branching
- Read replicas
- Point-in-time recovery
- Custom domains
- IPv4 add-on
- Log drains
- Upgraded compute
- Storage buckets for raw documents
- Edge Functions unless a future task proves they are needed

Supabase Free Plan is appropriate for the classroom demo because the expected dataset and usage are very small. The current local baseline of 12 documents and 205 chunks is expected to fit comfortably within the Free Plan when stored as processed text and embeddings. Supabase Free projects can be paused for inactivity, so test and wake the project before demo day.

## 4. Data Upload Gate

Before any upload to Supabase, confirm all items:

- Public classroom deployment is still required.
- The uploaded content is approved for managed cloud storage.
- The uploaded content is processed text chunks, not raw PDFs/XLSX.
- The user has approved uploading all processed chunks required for the public classroom demo.
- The target dataset is the full local demo retrieval index after final ingestion, except any explicitly denied sensitive chunks.
- The selected Supabase region is acceptable.
- RLS remains enabled.
- There are no public read policies on RAG tables.

If any answer is uncertain, stop and use local demo mode until approval is clear.

Current approval:

- The user approved uploading all necessary processed chunks to Supabase so the public domain demo can behave like the local demo.
- This approval covers processed chunk text, document metadata, and embeddings.
- This approval does not cover raw PDFs/XLSX, `.env.local`, API keys, or unprocessed extracted dumps.

## 5. Create the Supabase Project

1. Open `https://supabase.com/dashboard`.
2. Create or select a Free Plan organization.
3. Create a new project.
4. Suggested project name: `ai-sales-assistant-3darchtech-demo`.
5. Select the Free Plan.
6. Select a nearby region. For Vietnam/Thailand classroom use, Singapore is a practical default if available.
7. Generate a strong database password and store it privately.
8. Wait until project status is ready.

Record privately:

```text
SUPABASE_PROJECT_REF=
SUPABASE_DB_PASSWORD=
```

Do not commit these values.

## 6. Collect API Values

From Supabase Dashboard:

1. Open the project.
2. Go to `Project Settings` > `API`.
3. Copy Project URL:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
```

4. Copy a publishable key, or legacy anon key if publishable keys are not available:

```env
NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable-or-legacy-anon-key>
```

5. Copy a secret key, or legacy service-role key if secret keys are not available:

```env
SUPABASE_SERVICE_ROLE_KEY=<secret-or-legacy-service-role-key>
```

Security rules:

- `NEXT_PUBLIC_SUPABASE_URL` is browser-visible.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` is browser-visible.
- `SUPABASE_SERVICE_ROLE_KEY` is server-side only.
- Never prefix the service-role/secret key with `NEXT_PUBLIC_`.
- Never paste keys into chat messages, screenshots, public docs, or Git.

## 7. Apply the pgvector Schema

Preferred Codex path:

- Use the Supabase plugin/app if authenticated.
- Run SQL/migrations through the Supabase tool when available.
- Run advisors after schema changes if the tool exposes them.

CLI fallback:

```powershell
npx supabase --help
npx supabase migration new create_rag_pgvector_schema
```

Copy the contents of:

```text
docs/technical/supabase-pgvector-schema.sql
```

into the generated migration:

```text
supabase/migrations/<timestamp>_create_rag_pgvector_schema.sql
```

Then link and apply:

```powershell
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db push --dry-run
npx supabase db push
npx supabase migration list
```

Dashboard fallback:

1. Open Supabase SQL Editor.
2. Paste the contents of `docs/technical/supabase-pgvector-schema.sql`.
3. Run the SQL once.
4. Save the SQL as a dashboard snippet for traceability.

Do not hand-name migration files. Use the Supabase CLI migration command when a file is added to the repository.

## 8. Verify Schema

Check in Supabase Dashboard or through SQL:

```sql
select to_regclass('public.rag_documents') as rag_documents;
select to_regclass('public.rag_chunks') as rag_chunks;
select proname from pg_proc where proname = 'match_rag_chunks';
```

Verify pgvector:

```sql
select extname, extnamespace::regnamespace::text
from pg_extension
where extname = 'vector';
```

Verify RLS:

```sql
select schemaname, tablename, rowsecurity
from pg_tables
where tablename in ('rag_documents', 'rag_chunks');
```

Verify no public policies:

```sql
select schemaname, tablename, policyname, roles, cmd
from pg_policies
where tablename in ('rag_documents', 'rag_chunks');
```

Expected result:

- `rag_documents` exists.
- `rag_chunks` exists.
- `match_rag_chunks` exists.
- `vector` extension exists under `extensions`.
- RLS is enabled on both tables.
- No `anon` or `authenticated` table policy exposes RAG data.

## 9. Vercel Environment Variables

Add these in Vercel Project Settings for Production:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable-or-legacy-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<secret-or-legacy-service-role-key>
RAG_BACKEND=supabase
```

Also add Gemini values:

```env
GOOGLE_GENERATIVE_AI_API_KEY=<server-side Gemini key>
GEMINI_MODEL=gemini-3.5-flash
GEMINI_EMBEDDING_MODEL=<approved embedding model>
GEMINI_MAX_OUTPUT_TOKENS=8192
```

Use Preview environment variables too if the first deployment will be tested as a Vercel Preview deployment.

## 10. Application Integration Checklist

Future Codex implementation should complete these steps before public deployment:

1. Install Supabase client:

```powershell
npm install @supabase/supabase-js
```

2. Add a server-only client utility, for example:

```text
lib/supabase/server.ts
```

Requirements:

- Read `NEXT_PUBLIC_SUPABASE_URL`.
- Read `SUPABASE_SERVICE_ROLE_KEY`.
- Throw a clear server-side configuration error if required values are missing.
- Never export the service key to client components.

3. Add an embedding service:

```text
lib/ai/embeddings.ts
```

Requirements:

- Use the approved Gemini embedding model.
- Confirm output dimension before inserting into `extensions.vector(768)`.
- If the chosen model does not return 768 dimensions, update the schema deliberately before uploading data.

4. Add a Supabase ingestion script:

```text
scripts/upload-rag-to-supabase.mjs
```

Requirements:

- Read the full approved local demo chunk set from local generated data.
- Upsert `rag_documents` by `document_id`.
- Upsert `rag_chunks` by `chunk_id`.
- Generate and store embeddings.
- Skip unchanged chunks when possible.
- Print a summary: documents upserted, chunks upserted, skipped chunks, failed chunks.
- Do not upload raw files.

5. Add a Supabase retrieval service:

```text
lib/rag/supabase-retrieval.ts
```

Requirements:

- Generate query embedding.
- Call `match_rag_chunks(...)` with threshold and limit.
- Map rows to the existing local retrieval/citation shape.
- Support document type and service category filters if needed.
- Fall back to local lexical retrieval if Supabase is not configured or fails.

6. Wire chat/proposal services:

- Use Supabase retrieval when `RAG_BACKEND=supabase`.
- Use local retrieval when `RAG_BACKEND=local` or Supabase fails.
- Preserve source-grounded guardrails and sales review notes.

## 11. Data Upload Procedure

1. Run local ingestion first:

```powershell
npm run ingest
```

2. Review the generated local chunks:

```text
data/chunks/retrieval-index.json
```

3. Use the full local retrieval index as the default upload source so the public demo has coverage close to local.
4. Exclude only explicitly denied sensitive chunks, if any are identified during the final review.
5. Confirm the approved chunk count is small enough for Free Plan.
6. Upload approved chunks:

```powershell
node scripts/upload-rag-to-supabase.mjs
```

7. Verify row counts:

```sql
select count(*) as documents from rag_documents;
select count(*) as chunks from rag_chunks;
select count(*) as chunks_with_embeddings from rag_chunks where embedding is not null;
```

8. Test the RPC with one known query embedding after the application embedding service exists.

Expected baseline after uploading the current local demo data:

- `rag_documents`: approximately 12 rows
- `rag_chunks`: approximately 205 rows
- `rag_chunks where embedding is not null`: approximately 205 rows

## 12. Security Verification

Before deployment:

- Confirm `.env.local` is ignored.
- Confirm `data/source-pdfs/` is ignored.
- Confirm `data/extracted/` is ignored.
- Confirm `data/chunks/` is ignored.
- Confirm no source PDFs/XLSX are inside `public/`.
- Confirm the browser bundle does not include `SUPABASE_SERVICE_ROLE_KEY`.
- Confirm the browser bundle does not include Gemini keys.
- Confirm RAG tables do not have public read policies.
- Confirm the match RPC is not executable by `anon` or `authenticated`.
- Confirm Supabase account and GitHub account have MFA/2FA enabled where possible.

Supabase production checklist recommends enabling RLS on exposed tables, using SSL, and protecting administrator accounts with MFA. For this demo, RLS and key isolation are mandatory; SSL is provided through Supabase connection endpoints; MFA is strongly recommended for the account owner.

## 13. Deployed Smoke Test

Against the Vercel URL:

1. Load `/`.
2. Load `/chat`.
3. Ask:

```text
Explain how a 3D visualization or digital twin service can help a manufacturing client improve production visibility. Use available internal sources and keep unsupported details as items to confirm.
```

4. Confirm the answer uses Supabase-backed source citations.
5. Load `/prompts`.
6. Use a prompt in chat.
7. Load `/proposal`.
8. Generate the manufacturing proposal demo case.
9. Export DOCX.
10. Open print-friendly preview.
11. Check Vercel logs for repeated server errors.
12. Check Supabase logs/query volume.

## 14. Troubleshooting

If `match_rag_chunks(...)` returns no rows:

- Confirm chunks have embeddings.
- Confirm query embedding dimension is 768.
- Lower `match_threshold` temporarily.
- Confirm filters are not too restrictive.
- Confirm the same embedding model is used for documents and queries.

If Vercel API routes return 500:

- Check Vercel environment variables.
- Confirm `SUPABASE_SERVICE_ROLE_KEY` is present in server env only.
- Check Gemini key and model names.
- Read `vercel logs <deployment-url>`.

If Supabase rejects access:

- Confirm the server client uses the service-role/secret key.
- Confirm the key has not been accidentally placed in `NEXT_PUBLIC_*`.
- Confirm the RPC grant still includes `service_role`.
- Confirm RLS remains enabled and no accidental public policy was added.

If Gemini quota fails:

- Keep local fallback enabled.
- Reduce demo prompts.
- Do not switch to paid billing without explicit approval.

## 15. Post-Demo Cleanup

After the classroom demo:

1. Remove public sharing links if no longer needed.
2. Rotate exposed or classroom-used keys.
3. Delete Supabase rows if internal chunks should not remain in cloud storage.
4. Keep migration/schema files, but do not commit secrets or source materials.
5. Update `docs/progress.md` with the final deployment URL, status, and cleanup actions.
