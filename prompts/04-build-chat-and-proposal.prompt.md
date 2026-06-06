# Prompt 04 — Build Chat and Proposal Features

/local
/auto-context

Build the AI features for the demo.

Read:
@docs/business/01-business-requirements.md
@docs/product/02-product-requirements.md
@docs/technical/03-technical-design.md
@docs/technical/04-rag-data-design.md
@docs/product/05-ui-ux-spec.md
@data/chunks/
@docs/tasks.md
@docs/progress.md

Work Package:
1. Implement intent router.
2. Implement Knowledge Q&A over internal materials.
3. Implement business-friendly technical term explainer.
4. Implement proposal generator using client inputs and retrieved materials.
5. Display source references for answers.
6. Add sample prompts and demo scenarios.
7. Add basic error handling and loading states.

Rules:
- Use Gemini API if configured; otherwise create a clear local/mock fallback.
- Never expose API keys to client-side code.
- Do not invent company facts.
- Mark missing source data as NEEDS_INPUT.
- Update tasks/progress.
