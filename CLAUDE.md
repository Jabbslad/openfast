# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

OpenFast is a privacy-first intermittent fasting tracker PWA. All data stays on-device via IndexedDB (Dexie). No server, no accounts, fully offline.

The app code lives in `openfast/` — all commands should be run from that directory.

## Commands

```bash
cd openfast

npm run dev              # Dev server on localhost:5173 (use --host 0.0.0.0 for LAN)
npm run build            # TypeScript check + production build
npm run lint             # TypeScript type-check only (tsc --noEmit)
npm run test             # Vitest watch mode
npm run test:run         # Single test run (use in CI/scripts)

# Run a single test file
npx vitest run src/utils/zones.test.ts

# Run tests matching a pattern
npx vitest run --grep "ProgressRing"
```

Deployment happens automatically via GitHub Actions on push to `master`. The site is at `https://jabbslad.github.io/openfast/`.

## Architecture

**Routing**: React Router v6 with `BrowserRouter`. The `basename` is set from `import.meta.env.BASE_URL` to support both local dev (`/`) and GitHub Pages (`/openfast/`).

**Database**: Dexie.js wrapping IndexedDB with 6 tables: `fastingSessions`, `mealLogs`, `hydrationEntries`, `streaks`, `badges`, `userProfile`. Schema is in `src/db/database.ts`. Hooks in `src/hooks/` contain all DB mutation logic — screens don't call Dexie directly for writes.

**Fasting Zones**: 5 metabolic zones (Anabolic → Catabolic → Fat Burning → Ketosis → Deep Ketosis) defined in `src/utils/zones.ts` with rich content in `src/content/zone-details.ts`. Zones are time-based (absolute hours elapsed, not protocol-relative). The progress ring renders colored segments per zone with curved SVG `<textPath>` labels.

**Bottom Sheets**: All modal surfaces (ZoneExplorer, EditStartTimeSheet, FastDetailSheet, ChangelogSheet) share the same pattern: `visible`/`sheetUp` state for mount/animation, `bg-[#12121f] rounded-t-3xl`, backdrop blur. Drag-to-dismiss is provided by `src/hooks/useSheetDrag.ts`.

**Progress Ring** (`src/components/ProgressRing.tsx`): The most complex component. Renders zone-colored arc segments on the track, a progress arc with head glow, and curved text labels. Ring scale auto-adjusts to show one zone past the protocol target. Zone colors and glow colors are passed as props from TimerScreen.

**Slide-to-End**: Replaces a tap button for ending fasts. Requires dragging to 85% of track width. Uses pointer events with `setPointerCapture` for cross-device support.

**Notifications**: Uses `ServiceWorkerRegistration.showNotification()` (not `new Notification()`) for iOS PWA compatibility. Zone transition notifications fire when the zone ID changes between ticks. Permission is requested on first fast start and can be managed in Settings.

**Version**: Injected at build time via Vite's `define` option as `__APP_VERSION__`. Format: `0.1.0-<git short hash>`. Uses `GITHUB_SHA` in CI, `git rev-parse` locally.

## Agent Workflow

See [AGENTS.md](AGENTS.md) for commit requirements. Every commit must update the changelog and semver version before pushing.

## Key Conventions

- Dark theme only. Background: `#0f0f1a` → `#1a1a2e` gradient. Accent: indigo. Surface: `bg-white/[0.04]` with `border-white/[0.06]`.
- Tailwind CSS for all styling. No CSS modules or styled-components.
- Zone colors: Anabolic `#818cf8`, Catabolic `#38bdf8`, Fat Burning `#f59e0b`, Ketosis `#a78bfa`, Deep Ketosis `#4ade80`.
- Touch targets: minimum 44px (`min-h-[44px] min-w-[44px]`).
- `body { position: fixed }` + `h-[100dvh]` + `overflow: hidden` on root prevents iOS rubber-band bounce. Scrollable screens use `overflow-y-auto` on their own container.
- Tests use Vitest + React Testing Library + `fake-indexeddb`. Each screen test does `db.delete()` + `db.open()` in `beforeEach`.
- See [AGENTS.md](AGENTS.md) for changelog and versioning rules.

## GitHub Pages Specifics

- `vite.config.ts` sets `base: "/openfast/"` when `GITHUB_PAGES` env var is set.
- `public/404.html` handles SPA client-side routing (redirects unknown paths to base).
- PWA icons must be in `public/icons/`.
- "Check for Updates" in Settings unregisters service workers and clears caches.
