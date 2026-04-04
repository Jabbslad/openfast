import { describe, it, expect, vi, beforeEach } from "vitest";
import { requestPermission, sendNotification, isSupported } from "./notifications";

beforeEach(() => { vi.restoreAllMocks(); });

describe("isSupported", () => {
  it("returns true when Notification API exists", () => {
    vi.stubGlobal("Notification", { permission: "default" });
    expect(isSupported()).toBe(true);
  });
  it("returns false when Notification API is missing", () => {
    vi.stubGlobal("Notification", undefined);
    expect(isSupported()).toBe(false);
  });
});

describe("requestPermission", () => {
  it("returns granted when user accepts", async () => {
    vi.stubGlobal("Notification", { permission: "default", requestPermission: vi.fn().mockResolvedValue("granted") });
    const result = await requestPermission();
    expect(result).toBe("granted");
  });
});

describe("sendNotification", () => {
  it("creates a Notification when permission is granted", () => {
    const mockConstructor = vi.fn();
    vi.stubGlobal("Notification", Object.assign(mockConstructor, { permission: "granted" }));
    sendNotification("Test title", "Test body");
    expect(mockConstructor).toHaveBeenCalledWith("Test title", { body: "Test body", icon: "/icons/icon-192.png" });
  });
  it("does nothing when permission is not granted", () => {
    const mockConstructor = vi.fn();
    vi.stubGlobal("Notification", Object.assign(mockConstructor, { permission: "denied" }));
    sendNotification("Test", "Body");
    expect(mockConstructor).not.toHaveBeenCalled();
  });
});
