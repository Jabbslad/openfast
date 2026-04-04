import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../db/database";
import { evaluateBadges, BADGE_DEFINITIONS } from "./useBadges";

beforeEach(async () => { await db.delete(); await db.open(); });

describe("BADGE_DEFINITIONS", () => {
  it("defines 9 badges", () => { expect(BADGE_DEFINITIONS).toHaveLength(9); });
});

describe("evaluateBadges", () => {
  it("awards first_fast badge after 1 completed fast", async () => {
    await db.fastingSessions.add({ startTime: new Date(2026, 3, 3, 20, 0), endTime: new Date(2026, 3, 4, 12, 0), protocol: "16:8", targetDurationMs: 57_600_000, status: "completed" });
    const newBadges = await evaluateBadges();
    expect(newBadges.map((b) => b.type)).toContain("first_fast");
  });

  it("does not award the same badge twice", async () => {
    await db.fastingSessions.add({ startTime: new Date(), endTime: new Date(), protocol: "16:8", targetDurationMs: 57_600_000, status: "completed" });
    await evaluateBadges();
    const secondRun = await evaluateBadges();
    expect(secondRun).toHaveLength(0);
  });

  it("awards extended badge for 20h+ fast", async () => {
    const start = new Date(2026, 3, 3, 12, 0);
    const end = new Date(2026, 3, 4, 9, 0); // 21 hours
    await db.fastingSessions.add({ startTime: start, endTime: end, protocol: "20:4", targetDurationMs: 20 * 60 * 60 * 1000, status: "completed" });
    const newBadges = await evaluateBadges();
    expect(newBadges.map((b) => b.type)).toContain("extended");
  });

  it("awards early_bird for fast started before 8 PM", async () => {
    await db.fastingSessions.add({ startTime: new Date(2026, 3, 4, 19, 0), endTime: new Date(2026, 3, 5, 11, 0), protocol: "16:8", targetDurationMs: 57_600_000, status: "completed" });
    const newBadges = await evaluateBadges();
    expect(newBadges.map((b) => b.type)).toContain("early_bird");
  });

  it("awards protocol_explorer for 3 different protocols", async () => {
    for (const proto of ["16:8", "18:6", "20:4"]) {
      await db.fastingSessions.add({ startTime: new Date(), endTime: new Date(), protocol: proto, targetDurationMs: 57_600_000, status: "completed" });
    }
    const newBadges = await evaluateBadges();
    expect(newBadges.map((b) => b.type)).toContain("protocol_explorer");
  });
});
