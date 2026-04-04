import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TipsGuides } from "./TipsGuides";

describe("TipsGuides", () => {
  it("shows all categories", () => {
    render(<TipsGuides />);
    expect(screen.getByText("Getting Started")).toBeInTheDocument();
    expect(screen.getByText("Protocols Explained")).toBeInTheDocument();
    expect(screen.getByText("Hydration")).toBeInTheDocument();
    expect(screen.getByText("Common Questions")).toBeInTheDocument();
  });
  it("shows guide titles", () => {
    render(<TipsGuides />);
    expect(screen.getByText("What Is Intermittent Fasting?")).toBeInTheDocument();
  });
  it("expands guide body on click", async () => {
    const user = userEvent.setup();
    render(<TipsGuides />);
    await user.click(screen.getByText("What Is Intermittent Fasting?"));
    expect(screen.getByText(/eating pattern that cycles/)).toBeInTheDocument();
  });
});
