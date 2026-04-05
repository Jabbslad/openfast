export function setBadge(count?: number): void {
  if ("setAppBadge" in navigator) {
    (navigator as unknown as { setAppBadge: (n?: number) => Promise<void> })
      .setAppBadge(count)
      .catch(() => {});
  }
}

export function clearBadge(): void {
  if ("clearAppBadge" in navigator) {
    (navigator as unknown as { clearAppBadge: () => Promise<void> })
      .clearAppBadge()
      .catch(() => {});
  }
}
