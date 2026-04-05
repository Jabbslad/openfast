const DEFAULT_THEME_COLOR = "#0f0f1a";

export function setThemeColor(color: string): void {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", color);
  }
}

export function resetThemeColor(): void {
  setThemeColor(DEFAULT_THEME_COLOR);
}
