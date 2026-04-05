# AGENTS.md

## Commit Requirements

Before every commit, you MUST:

1. **Update the changelog** in `openfast/src/content/changelog.ts`:
   - Add new entries to the top of the `CHANGELOG` array (newest first)
   - If the current version already has an entry for today, append changes to it
   - If this is a new version, create a new entry with today's date
   - **Only log user-facing functionality changes** — new features, bug fixes, UX improvements, behaviour changes
   - **Do NOT log**: test additions/updates, markdown file changes (CLAUDE.md, AGENTS.md, README), refactors with no visible change, CI/build config tweaks, code comments

2. **Update the semver version** in `openfast/src/content/changelog.ts` and ensure it follows semantic versioning:
   - **Patch** (0.1.X): Bug fixes, styling tweaks, copy changes, small UX adjustments
   - **Minor** (0.X.0): New features, new screens, new components, significant UX changes
   - **Major** (X.0.0): Breaking changes, data schema migrations, complete redesigns

   The version in the changelog entry is the source of truth. The build system appends the git commit hash automatically.

3. **Verify before committing**:
   - Run `npx tsc --noEmit` from the `openfast/` directory
   - Run `npx vitest run` from the `openfast/` directory
   - Both must pass before committing
