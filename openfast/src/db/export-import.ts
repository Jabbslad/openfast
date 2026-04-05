import { db } from "./database";

interface ExportData {
  version: number;
  userProfile: unknown[];
  fastingSessions: unknown[];
  mealLogs: unknown[];
  hydrationEntries: unknown[];
  streaks: unknown[];
  badges: unknown[];
}

export async function exportAllData(): Promise<ExportData> {
  return {
    version: 1,
    userProfile: await db.userProfile.toArray(),
    fastingSessions: await db.fastingSessions.toArray(),
    mealLogs: await db.mealLogs.toArray(),
    hydrationEntries: await db.hydrationEntries.toArray(),
    streaks: await db.streaks.toArray(),
    badges: await db.badges.toArray(),
  };
}

export async function importAllData(data: ExportData, mode: "replace" | "merge"): Promise<void> {
  if (mode === "replace") { await clearAllData(); }
  await db.transaction("rw", [db.userProfile, db.fastingSessions, db.mealLogs, db.hydrationEntries, db.streaks, db.badges], async () => {
    for (const item of data.userProfile) { await db.userProfile.add(parseDates(item as Record<string, unknown>) as never); }
    for (const item of data.fastingSessions) { await db.fastingSessions.add(parseDates(item as Record<string, unknown>) as never); }
    for (const item of data.mealLogs) { await db.mealLogs.add(parseDates(item as Record<string, unknown>) as never); }
    for (const item of data.hydrationEntries) { await db.hydrationEntries.add(parseDates(item as Record<string, unknown>) as never); }
    for (const item of data.streaks) { await db.streaks.add(parseDates(item as Record<string, unknown>) as never); }
    for (const item of data.badges) { await db.badges.add(parseDates(item as Record<string, unknown>) as never); }
  });
}

export async function clearAllData(): Promise<void> {
  await db.transaction("rw", [db.userProfile, db.fastingSessions, db.mealLogs, db.hydrationEntries, db.streaks, db.badges], async () => {
    await db.userProfile.clear(); await db.fastingSessions.clear(); await db.mealLogs.clear();
    await db.hydrationEntries.clear(); await db.streaks.clear(); await db.badges.clear();
  });
  localStorage.removeItem("openfast-install-dismissed");
}

function parseDates(obj: Record<string, unknown>): Record<string, unknown> {
  const result = { ...obj };
  delete result.id;
  for (const key of Object.keys(result)) {
    const val = result[key];
    if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}T/.test(val)) { result[key] = new Date(val); }
  }
  return result;
}
