export interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "0.1.2",
    date: "2026-04-05",
    changes: [
      "Removed Meal Log tab from navigation bar (feature temporarily disabled)",
    ],
  },
  {
    version: "0.1.1",
    date: "2026-04-05",
    changes: [
      "Changelog sheet — tap the version number in Settings to view full release history",
      "Version number now includes git commit hash for traceability",
      "Added CLAUDE.md and AGENTS.md for AI-assisted development workflow",
    ],
  },
  {
    version: "0.1.0",
    date: "2026-04-05",
    changes: [
      "Fasting zones — 5 metabolic stages (Anabolic, Catabolic, Fat Burning, Ketosis, Deep Ketosis) with colored ring segments and curved text labels",
      "Zone Explorer — tap any zone on the timeline to see detailed body impact, benefits, and tips",
      "Slide-to-end — replaces the tap button to prevent accidental fast completion",
      "Zone transition notifications with motivational messages and per-zone emojis",
      "Edit fast start time via bottom sheet",
      "Fast history detail sheet with body impact summary",
      "Delete completed fasts from history",
      "Discard active fast via Edit Start Time sheet",
      "Drag-to-dismiss on all bottom sheets",
      "SVG stroke icons replacing emoji in the tab bar",
      "Thicker progress ring with comet-style head glow",
      "Responsive vertical spacing adapts to screen height",
      "Fixed tab bar at bottom with iOS overscroll bounce prevention",
      "Check for Updates in Settings (clears cache and reloads)",
      "Test Notification button when notifications are enabled",
      "Version number includes git commit hash",
      "GitHub Pages deployment with CI/CD",
    ],
  },
  {
    version: "0.0.1",
    date: "2026-04-04",
    changes: [
      "Initial release",
      "16:8, 14:10, 12:12, 18:6, 20:4, OMAD, and 5:2 fasting protocols",
      "Circular progress ring timer with goal tracking",
      "Meal logging with date navigation",
      "Hydration tracking with water drop grid and quick-add buttons",
      "Fasting and hydration streaks",
      "9 achievement badges",
      "Weekly calendar on Progress screen",
      "Data export, import, and clear",
      "Tips & Guides with fasting education content",
      "Dark theme, offline-first PWA",
    ],
  },
];
