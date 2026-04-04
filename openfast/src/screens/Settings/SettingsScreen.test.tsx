import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { SettingsScreen } from "./SettingsScreen";
import { db } from "../../db/database";

beforeEach(async () => {
  await db.delete();
  await db.open();
  await db.userProfile.add({ selectedProtocol: "16:8", dailyWaterGoalMl: 2500, createdAt: new Date() });
});

function renderSettings() {
  return render(<MemoryRouter><SettingsScreen /></MemoryRouter>);
}

describe("SettingsScreen", () => {
  it("shows fasting protocol setting", async () => {
    renderSettings();
    expect(await screen.findByText("Fasting Protocol")).toBeInTheDocument();
    expect(screen.getByText("16:8")).toBeInTheDocument();
  });
  it("shows hydration goal setting", async () => {
    renderSettings();
    expect(await screen.findByText("Daily Water Goal")).toBeInTheDocument();
  });
  it("shows data section with export/import/clear", async () => {
    renderSettings();
    expect(await screen.findByText("Export Data")).toBeInTheDocument();
    expect(screen.getByText("Import Data")).toBeInTheDocument();
    expect(screen.getByText("Clear All Data")).toBeInTheDocument();
  });
  it("shows tips & guides link", async () => {
    renderSettings();
    expect(await screen.findByText("Tips & Guides")).toBeInTheDocument();
  });
});
