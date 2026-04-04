import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressScreen } from "./ProgressScreen";
import { db } from "../../db/database";

beforeEach(async () => { await db.delete(); await db.open(); });

describe("ProgressScreen", () => {
  it("shows streak cards", async () => {
    render(<ProgressScreen />);
    expect(await screen.findByText("Fasting Streak")).toBeInTheDocument();
    expect(screen.getByText("Hydration Streak")).toBeInTheDocument();
    expect(screen.getByText("Total Fasts")).toBeInTheDocument();
  });
  it("shows badge section", async () => {
    render(<ProgressScreen />);
    expect(await screen.findByText("Badges")).toBeInTheDocument();
  });
  it("shows earned badges", async () => {
    await db.badges.add({ type: "first_fast", name: "First Fast", description: "Complete 1 fast", earnedAt: new Date() });
    render(<ProgressScreen />);
    expect(await screen.findByText("First Fast")).toBeInTheDocument();
  });
  it("shows fasting history", async () => {
    await db.fastingSessions.add({ startTime: new Date(2026, 3, 4, 20, 0), endTime: new Date(2026, 3, 5, 12, 0), protocol: "16:8", targetDurationMs: 57_600_000, status: "completed" });
    render(<ProgressScreen />);
    expect(await screen.findByText("History")).toBeInTheDocument();
    expect(await screen.findByText(/16:8/)).toBeInTheDocument();
  });
});
