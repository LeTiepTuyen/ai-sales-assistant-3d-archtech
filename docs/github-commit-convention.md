# Commit Message Convention

This repository uses [Conventional Commits](https://www.conventionalcommits.org/) with short, professional English commit messages.

## Format

`type(scope): summary`

### Rules

- Write the summary in English.
- Keep the summary imperative and concise.
- Prefer one change per commit.
- Keep the subject line under 72 characters when possible.
- Use the optional scope to show the affected area.

## Allowed Types

- `feat`: new user-facing functionality.
- `fix`: a bug fix.
- `chore`: repository maintenance, tooling, or setup.
- `docs`: documentation-only changes.
- `refactor`: internal code restructuring without behavior change.
- `test`: tests and test harness updates.
- `build`: build system or dependency changes.

## Examples

- `chore(repo): add GitHub workflow and ignore rules`
- `docs(workflow): describe commit slicing and validation steps`
- `feat(chat): render markdown responses with styled headings`
- `fix(chat): remove sources block from Gemini response text`

## Good Examples

- `feat(chat): improve markdown rendering for assistant answers`
- `chore(ci): add minimal validation workflow`
- `docs(repo): document public repository rules`

## Poor Examples

- `update stuff`
- `fix`
- `misc changes`
- `final update`