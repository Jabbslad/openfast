import { describe, it, expect, beforeEach } from "vitest";
import { db } from "./database";
import type { FastingSession, MealLog, HydrationEntry } from "../types";

beforeEach(async () => {
  await db.delete();
  await db.open();
});

describe("database schema", () => {
  it("has all expected tables", () => {
    const tableNames = db.tables.map((t) => t.name).sort();
    expect(tableNames).toEqual(["badges", "fastingSessions", "hydrationEntries", "mealLogs", "streaks", "userProfile"]);
  });
});

describe("fastingSessions CRUD", () => {
  it("creates and retrieves a fasting session", async () => {
    const session: FastingSession = { startTime: new Date(2026, 3, 4, 20, 0), protocol: "16:8", targetDurationMs: 16 * 60 * 60 * 1000, status: "active" };
    const id = await db.fastingSessions.add(session);
    const retrieved = await db.fastingSessions.get(id);
    expect(retrieved).toBeDefined();
    expect(retrieved!.protocol).toBe("16:8");
    expect(retrieved!.status).toBe("active");
  });

  it("queries active sessions", async () => {
    await db.fastingSessions.add({ startTime: new Date(), protocol: "16:8", targetDurationMs: 57_600_000, status: "active" });
    await db.fastingSessions.add({ startTime: new Date(), protocol: "16:8", targetDurationMs: 57_600_000, status: "completed", endTime: new Date() });
    const active = await db.fastingSessions.where("status").equals("active").toArray();
    expect(active).toHaveLength(1);
  });
});

describe("mealLogs CRUD", () => {
  it("creates and queries meals by date range", async () => {
    const today = new Date(2026, 3, 4, 12, 30);
    const yesterday = new Date(2026, 3, 3, 19, 0);
    await db.mealLogs.add({ timestamp: today, description: "Lunch" });
    await db.mealLogs.add({ timestamp: yesterday, description: "Dinner" });
    const startOfToday = new Date(2026, 3, 4, 0, 0, 0, 0);
    const endOfToday = new Date(2026, 3, 4, 23, 59, 59, 999);
    const todayMeals = await db.mealLogs.where("timestamp").between(startOfToday, endOfToday, true, true).toArray();
    expect(todayMeals).toHaveLength(1);
    expect(todayMeals[0].description).toBe("Lunch");
  });
});

describe("hydrationEntries CRUD", () => {
  it("creates entries and sums daily total", async () => {
    await db.hydrationEntries.add({ timestamp: new Date(2026, 3, 4, 9, 0), amountMl: 250 });
    await db.hydrationEntries.add({ timestamp: new Date(2026, 3, 4, 11, 0), amountMl: 500 });
    const startOfDay = new Date(2026, 3, 4, 0, 0, 0, 0);
    const endOfDay = new Date(2026, 3, 4, 23, 59, 59, 999);
    const entries = await db.hydrationEntries.where("timestamp").between(startOfDay, endOfDay, true, true).toArray();
    const total = entries.reduce((sum, e) => sum + e.amountMl, 0);
    expect(total).toBe(750);
  });
});

describe("userProfile", () => {
  it("creates and retrieves profile", async () => {
    await db.userProfile.add({ selectedProtocol: "16:8", dailyWaterGoalMl: 2500, createdAt: new Date() });
    const profiles = await db.userProfile.toArray();
    expect(profiles).toHaveLength(1);
    expect(profiles[0].selectedProtocol).toBe("16:8");
  });
});
