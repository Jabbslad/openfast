import "@testing-library/jest-dom/vitest";
import "fake-indexeddb/auto";

// Suppress DatabaseClosedError unhandled rejections that occur when
// async effects outlive component unmount during test teardown.
window.addEventListener("unhandledrejection", (event: PromiseRejectionEvent) => {
  const reason = event.reason;
  if (
    reason &&
    typeof reason === "object" &&
    "name" in reason &&
    (reason as { name: string }).name === "DatabaseClosedError"
  ) {
    event.preventDefault();
  }
});

// Mock matchMedia for jsdom (used by PWA detection)
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
