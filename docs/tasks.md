# Tasks

Last updated: 2026-06-07

## Phase 1 - Documents and Planning

- [x] Analyze rough idea and source data inventory.
- [x] Inspect available source file list under `data/source-pdfs/`.
- [x] Extract and review the sales prompt library from XLSX/PDF.
- [x] Create Business Requirements Document.
- [x] Create Product Requirements Document.
- [x] Create Technical Design Document.
- [x] Create RAG/Data Design Document.
- [x] Create UI/UX Specification.
- [x] Create Demo Script.
- [x] Create Deployment Plan.
- [x] Record planning decisions and progress.

## Phase 2 - MVP Scaffold

- [x] Scaffold Next.js App Router project structure.
- [x] Configure TypeScript.
- [x] Configure Tailwind CSS.
- [x] Add shadcn-style UI component setup.
- [x] Build web app shell and navigation.
- [x] Suppress root hydration warnings caused by browser-injected HTML/body attributes.
- [x] Build Chatbox page shell with placeholder interaction.
- [x] Build Proposal Generator page shell with placeholder preview.
- [x] Build Admin Data Sources page shell with placeholder ingestion states.
- [x] Add basic responsive web layout.
- [x] Add basic dashboard/home page.
- [x] Run local web app and verify main routes.

## Phase 3 - Data and RAG

- [x] Implement source file discovery for `data/source-pdfs/`.
- [x] Implement document registry metadata.
- [x] Implement XLSX prompt-library parser.
- [x] Implement PDF text extraction.
- [x] Add extraction quality status and manual-review warnings.
- [x] Implement chunking with document metadata.
- [x] Create local JSON fallback knowledge base.
- [x] Configure embedding provider behind server-side API key.
- [x] Implement local lexical retrieval service.
- [x] Prepare Supabase pgvector schema for later deployment.
- [x] Add source citation builder for generated answers.

## Phase 4 - AI Features

- [x] Implement intent router.
- [x] Implement knowledge-base Q&A.
- [x] Implement business-friendly technical term explainer.
- [x] Implement service recommendation flow.
- [x] Implement proposal generator.
- [x] Use prompt-library chunks in retrieval context.
- [x] Add `NEEDS_INPUT` handling rules.
- [x] Add server-side Gemini call path when `GOOGLE_GENERATIVE_AI_API_KEY` is configured.
- [x] Update Gemini default model to `gemini-3.5-flash` and keep example env secrets as placeholders.
- [x] Add local `.env.local` scaffold and robust Gemini API key detection.
- [x] Add local fallback when Gemini is not configured.
- [x] Make Gemini the primary chat/proposal generation path when a valid server-side key is configured.
- [x] Keep local fallback only for missing Gemini configuration or API request failure.
- [x] Add Chat API route.
- [x] Add Proposal Generate API route.
- [x] Render chat assistant answers as structured Markdown with visual headings, bold text, and clean bullets.
- [x] Support uploaded DOCX and text client briefs as proposal context in Chatbox responses.
- [x] Improve Chatbox proposal responses with a dedicated Gemini prompt contract, higher token budget, uploaded-brief citations, and longer client-ready manufacturing proposal structure.
- [x] Replace visible `NEEDS_INPUT` labels in app outputs with sales review notes while preserving source-grounded confirmation handling.

## Phase 5 - Export and Demo Polish

- [x] Implement proposal preview page.
- [x] Implement DOCX export.
- [x] Implement print-friendly proposal view.
- [x] Add Chatbox proposal response DOCX export and print-friendly preview actions.
- [x] Add Chatbox prompt textarea auto-grow with internal scrolling for long prompts.
- [x] Add Chatbox Stop Answering action with request abort handling.
- [x] Render Chatbox Markdown tables responsively and keep code-fenced table text from breaking layout.
- [x] Remove model/provider badge from Chatbox assistant responses for cleaner demo presentation.
- [x] Add sample prompts and demo scenario controls.
- [x] Add a ready-to-run demo cases runbook for the project demo day.
- [x] Add final presentation demo cases and practical client brief files for the public MVP demo.
- [x] Add dedicated `/proposal` draft page case to the final presentation demo script.
- [x] Add loading, error, empty, and missing-source states.
- [x] Run local demo and fix critical issues.
- [x] Add local smoke test for main demo flows.

## Phase 5.5 - Frontend UI Redesign and Prompt Hub

- [x] Review `ui-ux-pro-max-skill` guidance and apply design-system principles without adding a network-installed tool.
- [x] Redesign global theme around orange/black, modern technology styling.
- [x] Redesign app shell/sidebar and mobile navigation.
- [x] Remove `/chat` page header, mode dropdown, quick suggestions, and right source panel.
- [x] Rebuild `/chat` as a focused AI chat session UI.
- [x] Add chat attachment selection UI with file/image metadata chips and remove action.
- [x] Keep source citations inline inside assistant messages.
- [x] Add Prompt Hub route at `/prompts`.
- [x] Read prompt data from the source XLSX workbook on the server side.
- [x] Add Prompt Hub realtime search and category filtering.
- [x] Add Prompt Hub dynamic placeholder fields and live compiled preview.
- [x] Add copy actions for base and compiled prompts.
- [x] Add Prompt Hub prompt-list vertical scrolling and clearer copy/use-in-chat actions.
- [x] Make the Prompt Hub card list use a clear native vertical scrollbar for long prompt lists.
- [x] Update dashboard/data-source copy to reflect current local demo state.
- [x] Add `/prompts` to the local smoke test harness.
- [x] Browser-check desktop and mobile web UI for `/chat` and `/prompts`.
- [x] Align Prompt Hub desktop section layout with the three-column prompt mockup while preserving existing features and styling.
- [x] Add a collapsible desktop sidebar so Prompt Hub has more horizontal workspace.
- [x] Remove the desktop sidebar local-demo card and fix compact sidebar toggle spacing.

## Phase 6 - Deployment

- [x] Confirm whether public deployment is required.
- [x] Confirm whether approved processed internal data can be stored in Supabase for the public classroom demo.
- [x] Complete pre-deployment repository hygiene review before public deploy.
- [x] Prepare Supabase schema if deployed RAG is approved.
- [x] Add Supabase deployment setup guide for future pgvector deployment.
- [x] Harden Supabase pgvector schema with RLS and server-side vector match RPC.
- [x] Document Vercel deployment plan.
- [x] List required environment variables.
- [x] Verify planned safety rules for secrets and internal source files.
- [x] Update deployment docs for the selected Vercel + Supabase pgvector free-tier public demo path.
- [x] Deploy the FE/UI shell to Vercel production first.
- [x] Allowlist approved Prompt Hub source files for Vercel deployment so `/prompts` is populated publicly.
- [x] Add generated Prompt Hub fallback data so `/prompts` remains populated on Vercel even if the source XLSX is absent from the build bundle.
- [x] Hide the Admin Data Sources route from public navigation and Dashboard links while keeping the direct admin URL available.
- [x] Implement Supabase runtime integration for deployed RAG.
- [x] Add Gemini embedding provider behind a server-side API key.
- [x] Add full approved local demo chunk upload path for Supabase RAG tables.
- [x] Add Supabase-backed local smoke test script.
- [x] Install Supabase CLI locally on the deployment machine.
- [x] Authenticate Supabase CLI or provide a live project ref through the Supabase plugin/dashboard.
- [x] Create the live Supabase Free/nano demo project.
- [x] Apply Supabase schema to the live Free Plan project.
- [x] Configure local Supabase environment variables.
- [x] Configure Vercel Supabase/Gemini environment variables.
- [x] Upload approved processed demo chunks and embeddings to Supabase.
- [x] Run Supabase-backed local smoke test.
- [x] Run Supabase-backed deployed smoke test.
- [x] Deploy full public demo with Supabase-backed RAG if approved.
- [x] Update final demo checklist with local-only instructions.

## Phase 6.5 - GitHub Repository Standards

- [x] Confirm local Git initialization status.
- [x] Create public GitHub repository for the project.
- [x] Define a simple solo-maintainer GitHub workflow.
- [x] Define Conventional Commit message guidance.
- [x] Extend `.gitignore` for public repository safety.
- [x] Ignore temporary Prompt Hub QA artifacts before the public deployment commit.
- [x] Add GitHub Actions CI validation workflow.
- [x] Document repository workflow and commit standards in English.

## Immediate Next Step

Monitor the public classroom demo during use, keep the app on free tiers, and perform post-demo cleanup or key rotation if the public URL or secrets are no longer needed.
