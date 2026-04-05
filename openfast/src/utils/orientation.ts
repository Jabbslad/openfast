export function lockPortrait(): void {
  const screenOrientation = screen.orientation;
  if (screenOrientation && "lock" in screenOrientation) {
    (screenOrientation.lock as (o: string) => Promise<void>)("portrait-primary").catch(() => {});
  }
}
