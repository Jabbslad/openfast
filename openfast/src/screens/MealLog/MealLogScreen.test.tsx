import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MealLogScreen } from "./MealLogScreen";
import { db } from "../../db/database";

beforeEach(async () => { await db.delete(); await db.open(); });

describe("MealLogScreen", () => {
  it("shows today header and log meal button", async () => {
    render(<MealLogScreen />);
    expect(await screen.findByRole("heading", { name: "Today" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log meal/i })).toBeInTheDocument();
  });
  it("shows existing meals for today", async () => {
    await db.mealLogs.add({ timestamp: new Date(), description: "Grilled chicken salad" });
    render(<MealLogScreen />);
    expect(await screen.findByText("Grilled chicken salad")).toBeInTheDocument();
  });
  it("adds a new meal via modal", async () => {
    const user = userEvent.setup();
    render(<MealLogScreen />);
    await user.click(await screen.findByRole("button", { name: /log meal/i }));
    const input = screen.getByPlaceholderText(/what did you eat/i);
    await user.type(input, "Salmon and rice");
    await user.click(screen.getByRole("button", { name: /save/i }));
    expect(await screen.findByText("Salmon and rice")).toBeInTheDocument();
  });
  it("deletes a meal", async () => {
    await db.mealLogs.add({ timestamp: new Date(), description: "Remove me" });
    const user = userEvent.setup();
    render(<MealLogScreen />);
    expect(await screen.findByText("Remove me")).toBeInTheDocument();
    const deleteBtn = await screen.findByRole("button", { name: /delete/i });
    await user.click(deleteBtn);
    expect(screen.queryByText("Remove me")).not.toBeInTheDocument();
  });
});
