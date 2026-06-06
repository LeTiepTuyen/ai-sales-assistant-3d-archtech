# Final Demo Checklist

Project: AI Sales Assistant for 3D Archtech  
Last updated: 2026-06-06

## Local Demo Readiness

- [ ] Confirm source files exist under `data/source-pdfs/`.
- [ ] Run `npm install`.
- [ ] Run `npm run ingest`.
- [ ] Run `npm run dev`.
- [ ] Open `http://localhost:3000`.
- [ ] Run `npm run smoke` while the dev server is running.
- [ ] Confirm `npm run typecheck` passes.
- [ ] Confirm `npm run lint` passes.
- [ ] Confirm `npm run build` passes.

## Demo Flow

- [ ] Open Dashboard and explain local-first MVP scope.
- [ ] Open Chatbox.
- [ ] Ask: `Explain Digital Twin for a manufacturing client in business language.`
- [ ] Confirm answer shows intent, provider, sources, and `NEEDS_INPUT`.
- [ ] Open Proposal Generator.
- [ ] Click `Load Demo Scenario`.
- [ ] Click `Generate Draft`.
- [ ] Confirm proposal sections and sources are shown.
- [ ] Click `Preview`.
- [ ] Click `Print` or use browser print from the preview page.
- [ ] Click `DOCX` and confirm a Word document downloads.
- [ ] Open Admin Data Sources.
- [ ] Confirm ingestion summary and `needs_review` warnings are explainable.

## Safety Checks

- [ ] Do not expose `data/source-pdfs/` publicly.
- [ ] Do not expose `data/extracted/` or `data/chunks/` publicly without approval.
- [ ] Do not commit `.env.local`.
- [ ] Do not put API keys in client-side code.
- [ ] Rotate any Gemini API key that was pasted into chat, screenshots, or source files.
- [ ] Treat all generated proposals as drafts for sales review.
- [ ] Keep unsupported facts marked as `NEEDS_INPUT`.

## Deployment Approval Gate

- [ ] Confirm whether public deployment is required.
- [ ] Confirm whether internal extracted text may be stored in Supabase or any hosted database.
- [ ] Confirm Gemini API usage and cost limits.
- [ ] Confirm whether a basic admin/demo password is required.
- [ ] Get explicit approval before deploying to Vercel.

## Known Demo Caveats

- Gemini is the primary generation path when `GOOGLE_GENERATIVE_AI_API_KEY` is configured. Without a valid key, or if the Gemini request fails, the app uses local fallback responses. The configured default model is `gemini-3.5-flash`.
- Current retrieval is local lexical JSON search, not vector embeddings.
- Six large portfolio/showcase PDFs are marked `needs_review` because extracted text density is low relative to file size.
- Proposal preview uses browser `localStorage` for local demo handoff; it is not durable proposal persistence.
