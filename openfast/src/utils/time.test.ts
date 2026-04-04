import { describe, it, expect } from "vitest";
import { formatDuration, formatTime, getStartOfDay, getEndOfDay, isSameDay } from "./time";

describe("formatDuration", () => {
  it("formats zero ms", () => { expect(formatDuration(0)).toBe("00:00:00"); });
  it("formats hours, minutes, seconds", () => { expect(formatDuration(43_473_000)).toBe("12:04:33"); });
  it("formats over 24 hours", () => { expect(formatDuration(90_000_000)).toBe("25:00:00"); });
});

describe("formatTime", () => {
  it("formats a date to HH:MM AM/PM", () => {
    const d = new Date(2026, 3, 4, 14, 30);
    expect(formatTime(d)).toBe("2:30 PM");
  });
  it("formats midnight", () => {
    const d = new Date(2026, 3, 4, 0, 0);
    expect(formatTime(d)).toBe("12:00 AM");
  });
});

describe("getStartOfDay / getEndOfDay", () => {
  it("getStartOfDay returns midnight", () => {
    const d = new Date(2026, 3, 4, 14, 30, 45);
    const start = getStartOfDay(d);
    expect(start.getHours()).toBe(0);
    expect(start.getMinutes()).toBe(0);
    expect(start.getSeconds()).toBe(0);
    expect(start.getMilliseconds()).toBe(0);
  });
  it("getEndOfDay returns 23:59:59.999", () => {
    const d = new Date(2026, 3, 4, 14, 30, 45);
    const end = getEndOfDay(d);
    expect(end.getHours()).toBe(23);
    expect(end.getMinutes()).toBe(59);
    expect(end.getSeconds()).toBe(59);
    expect(end.getMilliseconds()).toBe(999);
  });
});

describe("isSameDay", () => {
  it("returns true for same day", () => {
    expect(isSameDay(new Date(2026, 3, 4, 10, 0), new Date(2026, 3, 4, 22, 0))).toBe(true);
  });
  it("returns false for different days", () => {
    expect(isSameDay(new Date(2026, 3, 4, 23, 59), new Date(2026, 3, 5, 0, 0))).toBe(false);
  });
});
