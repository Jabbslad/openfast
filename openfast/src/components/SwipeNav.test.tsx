import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SwipeNav } from "./SwipeNav";

describe("SwipeNav", () => {
  it("renders children", () => {
    render(
      <SwipeNav onSettingsTap={() => {}}>
        <div>Screen A</div>
        <div>Screen B</div>
        <div>Screen C</div>
      </SwipeNav>
    );
    expect(screen.getByText("Screen A")).toBeInTheDocument();
    expect(screen.getByText("Screen B")).toBeInTheDocument();
    expect(screen.getByText("Screen C")).toBeInTheDocument();
  });

  it("renders dot indicators for each child", () => {
    render(
      <SwipeNav onSettingsTap={() => {}}>
        <div>A</div>
        <div>B</div>
        <div>C</div>
      </SwipeNav>
    );
    expect(screen.getByLabelText("Go to Water")).toBeInTheDocument();
    expect(screen.getByLabelText("Go to Timer")).toBeInTheDocument();
    expect(screen.getByLabelText("Go to Progress")).toBeInTheDocument();
  });

  it("renders settings gear button", () => {
    const onSettingsTap = vi.fn();
    render(
      <SwipeNav onSettingsTap={onSettingsTap}>
        <div>A</div>
        <div>B</div>
        <div>C</div>
      </SwipeNav>
    );
    expect(screen.getByLabelText("Settings")).toBeInTheDocument();
  });
});
