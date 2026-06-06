# Decisions

Last updated: 2026-06-06

| Date | Decision | Rationale |
|---|---|---|
| 2026-06-05 | Use RAG instead of model fine-tuning for the MVP. | The available materials are internal documents and prompt templates; retrieval is simpler, cheaper, and more source-grounded than custom training. |
| 2026-06-05 | Build local-first before public deployment. | Local-first development reduces cost, protects internal documents, and supports the university demo workflow. |
| 2026-06-05 | Use Next.js App Router with TypeScript as the default application framework. | This matches the project guidance and supports both UI pages and server-side API routes. |
| 2026-06-05 | Use Tailwind CSS and shadcn/ui for the MVP interface. | This supports fast development of a professional business UI without custom design overhead. |
| 2026-06-05 | Use Vercel AI SDK with Google Gemini API if credentials are approved and available. | This matches the suggested stack and supports low-cost model integration. |
| 2026-06-05 | Use local JSON storage as the first knowledge-base fallback. | This keeps the demo runnable before database setup. |
| 2026-06-05 | Use Supabase Postgres with pgvector only if deployed persistent RAG is required and data handling is approved. | This avoids unnecessary infrastructure during local MVP development. |
| 2026-06-05 | Use DOCX export through a document-generation package and print-friendly HTML for PDF export. | This provides practical export features without heavy PDF infrastructure. |
| 2026-06-05 | Keep raw source PDFs/XLSX out of public assets and public repositories unless explicitly approved. | The materials may be internal company documents. |
| 2026-06-05 | Mark unsupported factual content as `NEEDS_INPUT`. | This prevents invented company facts, client results, timelines, pricing, or implementation details. |
| 2026-06-05 | Build only the web application UI for the MVP scaffold, not a native mobile app. | The project is a web demo; small-viewport QA is only to keep the web UI usable and does not expand scope to mobile app development. |
| 2026-06-05 | Use local lexical JSON retrieval as the first fallback before embeddings. | This makes the demo searchable locally without requiring cloud credentials. |
| 2026-06-05 | Treat extracted text and chunk JSON as internal derived data. | These files can contain source-document content and should not be exposed publicly without approval. |
| 2026-06-05 | Keep Gemini optional and server-side for Phase 4. | The demo must run locally without cloud credentials while still supporting Gemini if an API key is configured. |
| 2026-06-05 | Use browser `localStorage` for the current proposal preview handoff. | This is sufficient for local demo preview/print and avoids adding durable proposal persistence before deployment decisions. |
| 2026-06-05 | Use the `docx` package for server-side DOCX export. | It provides direct Word document generation without exposing client-side secrets or adding heavy PDF infrastructure. |
| 2026-06-06 | Apply `ui-ux-pro-max-skill` as design-system guidance instead of installing it as a project dependency. | The repository guidance is useful for palette, typography, UI style, accessibility, and stack decisions; installing an external CLI/skill is unnecessary for this local UI work package and would add avoidable network dependency. |
| 2026-06-06 | Use orange/black as the primary web app visual system. | This matches the requested modern technology direction and the supplied reference images while keeping the app business-focused. |
| 2026-06-06 | Keep `/chat` focused on a single chat session surface with inline citations. | The user requested removal of page header, mode selector, quick suggestions, and the source panel; inline citations preserve source awareness without distracting side panels. |
| 2026-06-06 | Implement chat attachments as local UI metadata until backend file processing is explicitly required. | This provides the expected upload interaction without transmitting files externally or implying unsupported document analysis. |
| 2026-06-06 | Add Prompt Hub at `/prompts` and read the prompt workbook server-side. | Server-side XLSX parsing keeps the feature source-grounded while avoiding exposing raw source files in the browser bundle. |
| 2026-06-06 | Use `gemini-3.5-flash` as the default Gemini text-generation model. | Google AI Studio and Google Gemini API documentation list it as the current stable text-output model, and the user's free-tier quota screen shows access to it. |
| 2026-06-06 | Keep real Google AI Studio keys out of `.env.example` and use `.env.local` or deployment secrets instead. | Example env files can be committed or shared; storing real credentials there risks exposing paid or quota-limited API access. |
| 2026-06-06 | Treat placeholder Gemini API key values as unconfigured. | This prevents the local demo from accidentally sending invalid requests when setup files still contain sample values. |
| 2026-06-06 | Prepare Supabase as an optional server-side pgvector backend, not a required local dependency. | The MVP remains local-first; Supabase should only store processed internal chunks and embeddings after deployment and data-handling approval. |
| 2026-06-06 | Enable RLS on Supabase RAG tables and avoid public read policies by default. | Source chunks can contain internal company material, so deployed retrieval should go through trusted server-side code using a secret/service-role key. |
| 2026-06-06 | Align Prompt Hub desktop layout through responsive CSS only. | The requested change concerns the position of the three Prompt Hub sections, so preserving React component behavior and existing visual styling keeps the feature maintainable and avoids unnecessary UI rewrites. |
| 2026-06-06 | Add a collapsible desktop sidebar and default Prompt Hub to compact navigation. | Prompt Hub benefits from horizontal workspace for its three panels, while a toggle preserves access to the full navigation labels when needed. |
| 2026-06-06 | Keep the desktop sidebar focused on navigation only. | Removing the local-demo information card reduces visual weight and gives the compact navigation state cleaner spacing for Prompt Hub work. |
| 2026-06-06 | Use Gemini as the primary server-side generation path once a valid key is configured, while keeping local retrieval for source context and local fallback for resilience. | This completes the intended model-backed demo flow without exposing secrets in the browser, and it keeps the app usable if the API key, model quota, or network access fails during the local demo. |
| 2026-06-06 | Use a simple solo-maintainer GitHub workflow with Conventional Commits and minimal CI validation. | The project is a personal demo repository, so a lightweight workflow is easier to manage while still keeping the history readable, the validation consistent, and the public repo safe. |
| 2026-06-06 | Extract uploaded DOCX and text client briefs on the server and use them as proposal context in Chatbox. | This gives the demo a realistic upload workflow for client proposal drafting without exposing the file-processing logic to the browser bundle. |
