# GitHub Workflow

This project uses a simple GitHub workflow optimized for a solo maintainer and a public demo repository.

## Branching Strategy

- Keep `main` as the stable integration branch.
- Use a short-lived feature branch only when a change is larger than a small local edit.
- Prefer direct, small commits on a focused branch instead of one large commit.
- Merge back only after validation passes locally.

## Commit Flow

1. Make one logical change at a time.
2. Keep the commit scope narrow by folder or feature area.
3. Run the relevant local checks before committing.
4. Push small commits in sequence instead of bundling unrelated work.
5. Use a clear Conventional Commit message in English.

## Recommended Commit Slices

- `chore(repo)`: repository bootstrap, ignore rules, workflow docs, and project standards.
- `chore(ci)`: GitHub Actions, validation scripts, and automation files.
- `docs(...)`: documentation updates for workflow, demo flow, or architecture notes.
- `feat(chat)`: Chatbox UI, chat service, and chat API changes.
- `feat(proposal)`: proposal generator, preview, and export changes.
- `feat(rag)`: ingestion scripts, local retrieval, chunking, and source indexing.
- `refactor(ui)`: shared UI components and visual system updates.
- `fix(...)`: bug fixes limited to one defect or one slice of behavior.

## Suggested Validation Before Merge

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run smoke` for local demo verification when the dev server is available

## Public Repository Rules

- Never commit `.env.local` or any real API key.
- Never commit raw internal source PDFs from `data/source-pdfs/` unless the data is explicitly approved for public release.
- Keep `data/extracted/` and `data/chunks/` private because they can contain internal source text.
- Review `docs/tasks.md`, `docs/progress.md`, and `docs/decisions.md` whenever a work package is completed.