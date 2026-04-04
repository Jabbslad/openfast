import Dexie, { type EntityTable } from "dexie";
import type { FastingSession, MealLog, HydrationEntry, Streak, Badge, UserProfile } from "../types";

class OpenFastDB extends Dexie {
  fastingSessions!: EntityTable<FastingSession, "id">;
  mealLogs!: EntityTable<MealLog, "id">;
  hydrationEntries!: EntityTable<HydrationEntry, "id">;
  streaks!: EntityTable<Streak, "id">;
  badges!: EntityTable<Badge, "id">;
  userProfile!: EntityTable<UserProfile, "id">;

  constructor() {
    super("openfast");
    this.version(1).stores({
      fastingSessions: "++id, startTime, status",
      mealLogs: "++id, timestamp",
      hydrationEntries: "++id, timestamp",
      streaks: "++id, &type",
      badges: "++id, &type",
      userProfile: "++id",
    });
  }
}

export const db = new OpenFastDB();
