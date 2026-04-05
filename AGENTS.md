# AGENTS.md

## Design Reference

See [DESIGN.md](DESIGN.md) for the design system reference. This file documents the SpaceX-inspired design language — use it as a guide for visual decisions including colour palette, typography, component styling, spacing, and depth/elevation patterns. When creating or modifying UI components, consult DESIGN.md to ensure consistency.

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

## iOS PWA Layout — DO NOT REGRESS

This app went through 15+ failed attempts to fix bottom safe-area issues on iOS. The following rules are non-negotiable:

1. **NEVER add `viewport-fit=cover`** to the viewport meta tag. Without it, iOS handles unsafe areas (status bar, home indicator) automatically using `theme-color`. With it, you become responsible for safe areas and the tools iOS provides (`env(safe-area-inset-*)`) are unreliable across versions.

2. **NEVER use `env(safe-area-inset-*)` anywhere.** It behaves inconsistently with `position: fixed`, `100dvh`, `100%`, and flexbox in iOS standalone PWA mode. There must be zero references to `safe-area-inset` in the entire codebase.

3. **NEVER place interactive navigation at the bottom of the screen.** The app uses swipe navigation with top-positioned dot indicators specifically to avoid bottom safe-area issues. Do not re-introduce a bottom tab bar, bottom nav, or any fixed-position element anchored to the screen bottom.

4. **Keep the CSS layout simple.** The correct structure is:
   ```css
   html, body { height: 100%; overflow: hidden; }
   body { background: linear-gradient(...) fixed; }
   #root { height: 100%; display: flex; flex-direction: column; overflow: hidden; }
   ```
   Screens are `bg-transparent` — the body gradient shows through.

5. **Set `theme-color` in index.html** to match the app background. iOS uses this for the status bar and home indicator areas.

If you find yourself writing CSS to handle iOS safe areas, **stop and redesign the UI** so the safe areas don't matter.
