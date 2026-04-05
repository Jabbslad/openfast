import { describe, it, expect, beforeEach, afterEach, afterAll } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HydrationScreen } from "./HydrationScreen";
import { db } from "../../db/database";

beforeEach(async () => {
  cleanup();
  await db.delete();
  await db.open();
  await db.userProfile.add({ selectedProtocol: "16:8", dailyWaterGoalMl: 2500, createdAt: new Date() });
});

afterEach(() => {
  cleanup();
});

afterAll(async () => {
  cleanup();
  await db.delete();
});

describe("HydrationScreen", () => {
  it("shows daily goal", async () => {
    render(<HydrationScreen />);
    expect(await screen.findByText(/2,500 ml/)).toBeInTheDocument();
  });
  it("shows quick-add buttons", async () => {
    render(<HydrationScreen />);
    expect(await screen.findByRole("button", { name: /250 ml/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /500 ml/i })).toBeInTheDocument();
  });
  it("adds water on quick-add click", async () => {
    const user = userEvent.setup();
    render(<HydrationScreen />);
    const btn = await screen.findByRole("button", { name: /250 ml/i });
    await user.click(btn);
    expect(await screen.findByText(/250/)).toBeInTheDocument();
  });
  it("shows entry log after adding", async () => {
    await db.hydrationEntries.add({ timestamp: new Date(), amountMl: 500 });
    render(<HydrationScreen />);
    expect(await screen.findByText("500 ml")).toBeInTheDocument();
  });
});
