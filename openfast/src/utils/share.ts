export function canShare(): boolean {
  return "share" in navigator;
}

export async function shareFastResult(opts: {
  protocol: string;
  durationLabel: string;
  zone: string;
}): Promise<boolean> {
  if (!canShare()) return false;
  try {
    await navigator.share({
      title: "OpenFast",
      text: `I just completed a ${opts.protocol} fast (${opts.durationLabel}) and reached the ${opts.zone} zone!`,
    });
    return true;
  } catch {
    return false;
  }
}

export async function shareStreak(count: number): Promise<boolean> {
  if (!canShare()) return false;
  try {
    await navigator.share({
      title: "OpenFast",
      text: `I'm on a ${count}-day fasting streak with OpenFast!`,
    });
    return true;
  } catch {
    return false;
  }
}
