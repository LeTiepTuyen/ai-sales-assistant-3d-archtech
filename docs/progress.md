# Progress

Last updated: 2026-06-06

## Current Status

GITHUB_REPOSITORY_BOOTSTRAP_AND_STANDARDS_DEFINED

## Completed

- Initial bootstrap folder structure reviewed.
- Project instructions in `AGENTS.md` reviewed.
- Rough Vietnamese idea reviewed and converted into professional planning documents.
- English project brief and data inventory reviewed.
- Source folder `data/source-pdfs/` inspected; expected PDF/XLSX source files are present.
- Sales prompt library extracted from XLSX/PDF and used to define MVP intent coverage.
- Business requirements, product requirements, technical design, RAG/data design, UI/UX specification, demo script, and deployment plan generated.
- Tasks and decisions updated for the planning milestone.
- Next.js App Router, TypeScript, Tailwind CSS, and shadcn-style component scaffolding added.
- Web application shell with persistent navigation added.
- Dashboard, Chatbox, Proposal Generator, and Admin Data Sources web pages added.
- Chat and proposal pages include placeholder local interactions only.
- Admin Data Sources page includes placeholder source registry and simulated re-ingestion state only.
- Local development server verified at `http://localhost:3000`.
- TypeScript, lint, and production build checks passed.
- Prompt 03 ingestion foundation implemented.
- PDF and XLSX source extraction implemented with local Node scripts.
- Extracted text is written under `data/extracted/`.
- Chunk JSON and retrieval index are written under `data/chunks/`.
- Local lexical JSON retrieval fallback implemented.
- Supabase pgvector schema prepared in `docs/technical/supabase-pgvector-schema.sql`.
- Ingestion run completed for 12 source documents with 205 chunks and 0 extraction failures.
- Prompt 04 chat and proposal features implemented.
- Intent router implemented for knowledge Q&A, technical explainer, service recommendation, proposal support, and sales response modes.
- Chat API route added at `/api/chat`.
- Proposal generation API route added at `/api/proposals/generate`.
- Data source summary API route added at `/api/data-sources`.
- Server-side Gemini integration path added; it only runs when `GOOGLE_GENERATIVE_AI_API_KEY` is configured.
- Gemini default generation model updated to `gemini-3.5-flash`; `.env.example` now uses placeholders instead of a real API key.
- Gemini API requests now send the server-side key via the `x-goog-api-key` header instead of a query string.
- Local `.env.local` scaffold added with an empty API-key slot and `gemini-3.5-flash` selected.
- Gemini configuration now treats placeholder key values as unconfigured and can also read `GEMINI_API_KEY` or `GOOGLE_API_KEY`.
- README, deployment plan, and final demo checklist updated for the Gemini 3.5 Flash setup and key-rotation guidance.
- TypeScript, lint, and production build checks passed after the Gemini setup update. The first sandboxed build hit a Windows `spawn EPERM`; rerunning the same build with approved elevated execution completed successfully.
- Supabase deployment setup guide added at `docs/technical/08-supabase-deployment-setup-guide.md`.
- Supabase env comments clarified in `.env.example` and `.env.local`.
- Supabase pgvector schema updated to enable RLS, use the `extensions.vector(768)` type, add an HNSW vector index, and expose a server-side `match_rag_chunks` RPC for future deployed retrieval.
- Supabase CLI is not currently installed on this machine; future migration file creation should use `npx supabase migration new create_rag_pgvector_schema` after installing the CLI locally.
- Local fallback response generation added when Gemini is not configured.
- Chat UI now calls the API and displays intent, provider, source references, and `NEEDS_INPUT`.
- Chat assistant responses now render structured Markdown with headings, bold emphasis, and clean bullet lists instead of raw `*` / `**` text.
- Chat API now extracts uploaded DOCX and text brief content and passes it into proposal-oriented responses.
- Proposal UI now calls the API and displays generated sections, source references, and `NEEDS_INPUT`.
- Proposal preview page added at `/proposal/preview`.
- Print-friendly proposal view added using browser print.
- DOCX export API added at `/api/proposals/export/docx`.
- Proposal Generator now supports demo scenario autofill, preview, print, and DOCX download controls.
- DOCX export API verified locally with generated proposal data.
- Local preview route verified with Playwright.
- Prompt 05 local run and deployment readiness package completed.
- README updated with setup, ingestion, local run, smoke test, demo flow, environment variables, and deployment safety notes.
- Local smoke test script added at `scripts/local-smoke-test.mjs`.
- Final demo checklist added at `docs/demo/07-final-demo-checklist.md`.
- Local test results recorded at `docs/demo/local-test-results.md`.
- Deployment plan updated with current env variable names, local output paths, and public-data safety rules.
- Frontend UI redesign work package completed.
- `ui-ux-pro-max-skill` repository guidance reviewed and applied as design-system principles without installing a network dependency.
- Global UI theme updated to an orange/black modern technology direction.
- App shell/sidebar and mobile navigation redesigned.
- `/chat` rebuilt as a focused AI chat session interface.
- `/chat` header/description, mode dropdown, quick suggestions, and right source panel removed.
- Chat attachment selection UI added for local file/image metadata chips with remove actions.
- Assistant source citations now appear inline inside chat messages.
- New Prompt Hub page added at `/prompts`.
- Prompt Hub reads source-grounded prompt data from `data/source-pdfs/[3D Archtech] Prompts for AI sales assistant.xlsx` on the server side.
- Prompt Hub includes realtime search, category filtering, dynamic placeholder inputs, live compiled preview, and copy actions.
- Prompt Hub desktop layout now follows the three-section mockup structure with the prompt library, context variables, and live preview aligned side by side while preserving existing styling and interactions.
- Desktop app navigation can now collapse to an icon rail, and `/prompts` defaults to the compact rail to provide more horizontal space for the Prompt Hub sections.
- Desktop sidebar cleanup removed the bottom local-demo information card and adjusted the compact toggle button so it no longer overlaps the logo icon.
- Browser QA confirmed the compact sidebar is 80px wide, the toggle button sits 12px below the logo icon without overlap, the local-demo card text is absent, and the Prompt Hub still renders three side-by-side sections.
- TypeScript, lint, production build, and local `/prompts` HTTP checks passed after the Prompt Hub layout alignment. The sandboxed build hit the known Windows `spawn EPERM`; rerunning with approved elevated execution completed successfully.
- Smoke test harness updated to include `/prompts`.
- Browser QA completed for `/chat` and `/prompts` on desktop and 390px mobile viewport.
- TypeScript, lint, smoke test, and production build checks passed after the redesign.
- Deployment work is paused; Supabase setup remains documented for future use but is not the current implementation focus.
- Chat generation now attempts Gemini whenever a valid server-side Gemini API key is configured, even when retrieval finds no source chunks. In no-source cases, the Gemini prompt requires `NEEDS_INPUT` instead of unsupported facts.
- Chat and proposal generation now catch Gemini request failures and fall back locally instead of returning a 500 response to the UI.
- Proposal generation now uses Gemini as the primary section-drafting path when the server-side key is configured; local proposal sections remain a safety fallback.
- Dashboard, sidebar, and README copy updated to describe Gemini-backed generation with local retrieval context.
- Public GitHub repository created for the project.
- Simple solo-maintainer GitHub workflow documented in `docs/github-workflow.md`.
- Conventional Commit guidance documented in `docs/github-commit-convention.md`.
- `.gitignore` extended for public repository hygiene.
- Minimal GitHub Actions CI workflow added at `.github/workflows/ci.yml`.

## Important Notes

- The project folder was not initially detected as a Git repository; GitHub repository bootstrap is now in progress.
- Large source PDFs were not fully content-analyzed in this planning step. Future ingestion work must validate text extraction quality before source-specific company claims are used.
- The assistant should use RAG rather than fine-tuning for the MVP.
- Missing or unsupported details must be marked as `NEEDS_INPUT`.
- Raw internal source files under `data/source-pdfs/` should not be exposed publicly without approval.
- Prompt 02 implemented web application UI only. No native mobile app was built.
- Small-viewport checks were used only to prevent web layout overflow, not to create a mobile application.
- The current UI uses local retrieval for source context and Gemini for generation when `GOOGLE_GENERATIVE_AI_API_KEY` is configured.
- Extracted text and chunk outputs may contain internal source material and are ignored by `.gitignore`.
- Six large portfolio/showcase PDFs are marked `needs_review` because extracted text density is low relative to PDF size. They may be image-heavy and should be reviewed before citation use.
- Embeddings remain pending. Current retrieval is local lexical JSON search.
- Gemini remains server-side only. Without a valid key or when a Gemini request fails, the app uses local fallback responses.
- Generated chat/proposal outputs are draft content and still require sales review before external use.
- DOCX export uses the `docx` package and server-side route handling.
- Proposal preview data is stored in browser `localStorage` for local demo convenience, not as durable persistence.
- Public deployment has not been performed and requires explicit approval.
- Google/Gemini API key is now configured for the intended Gemini-backed demo path, but local fallback mode remains available for resilience.
- The previously shared Google AI Studio key should be treated as exposed and rotated before use.
- Prompt Hub category labels are derived from source workbook use-case wording for UI filtering only; prompt content remains source-grounded from the XLSX workbook.
- Browser plugin telemetry showed external Statsig/Cloudflare network warnings during QA; app console logs for localhost were clean.

## Next Step

1. Initialize local Git and connect it to the new GitHub repository.
2. Continue development in small commits that follow the documented convention.
3. Review `/chat` and `/proposal` locally with the configured Gemini key.
