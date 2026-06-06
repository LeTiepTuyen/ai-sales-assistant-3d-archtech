# Local Test Results

Last updated: 2026-06-06

## Environment

- Local URL: `http://localhost:3000`
- Mode: local web application demo
- Gemini API key: configured locally for the Gemini-backed demo path; local fallback is retained for missing key or API failure.
- Deployment: not performed.

## Latest Verification

| Check | Result |
|---|---|
| Local URL responds | Passed |
| Dashboard route | Passed |
| Chatbox route | Passed |
| Prompt Hub route | Passed |
| Proposal Generator route | Passed |
| Admin Data Sources route | Passed |
| Proposal Preview route | Passed |
| Data source API | Passed |
| Chat API with source references | Passed |
| Proposal generation API | Passed |
| DOCX export API | Passed |
| `/chat` focused chat UI browser check | Passed |
| `/chat` attachment UI DOM/browser check | Passed |
| `/prompts` search/filter/dynamic field/copy browser check | Passed |
| 390px mobile web responsive check for `/chat` and `/prompts` | Passed |
| TypeScript check | Passed |
| ESLint | Passed |
| Production build | Passed outside sandbox due to Next.js worker spawn permission |

## Remaining Issues

- No public deployment has been performed.
- Live Gemini API smoke testing was not run in this verification pass to avoid consuming quota without explicit approval.
- Embedding/vector retrieval is not implemented; local lexical retrieval currently supplies source context for Gemini.
- `needs_review` source documents should be reviewed before relying on their extracted text for final citations.
- Chat attachments currently send local file metadata only; binary file processing is not implemented yet.
- Browser plugin telemetry emitted external Statsig/Cloudflare warnings during QA, but localhost app console logs were clean.
