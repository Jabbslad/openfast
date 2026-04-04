import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TimerScreen } from "./TimerScreen";
import { db } from "../../db/database";

beforeEach(async () => {
  await db.delete();
  await db.open();
  await db.userProfile.add({ selectedProtocol: "16:8", dailyWaterGoalMl: 2500, createdAt: new Date() });
});

describe("TimerScreen", () => {
  it("shows idle state with Start Fast button", async () => {
    render(<TimerScreen />);
    expect(await screen.findByRole("button", { name: /start fast/i })).toBeInTheDocument();
  });
  it("shows the selected protocol", async () => {
    render(<TimerScreen />);
    expect(await screen.findByText(/16:8 Protocol/i)).toBeInTheDocument();
  });
  it("starts a fast when button is clicked", async () => {
    const user = userEvent.setup();
    render(<TimerScreen />);
    const btn = await screen.findByRole("button", { name: /start fast/i });
    await user.click(btn);
    expect(await screen.findByRole("button", { name: /end fast/i })).toBeInTheDocument();
  });
  it("shows progress ring when fast is active", async () => {
    const user = userEvent.setup();
    render(<TimerScreen />);
    const btn = await screen.findByRole("button", { name: /start fast/i });
    await user.click(btn);
    expect(await screen.findByRole("progressbar")).toBeInTheDocument();
  });
});
