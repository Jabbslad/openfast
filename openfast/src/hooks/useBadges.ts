import { db } from "../db/database";
import type { Badge, BadgeType } from "../types";

interface BadgeDefinition {
  type: BadgeType;
  name: string;
  icon: string;
  description: string;
  check: () => Promise<boolean>;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    type: "first_fast",
    name: "First Fast",
    icon: "🏁",
    description: "Complete your first fasting session.",
    check: async () => {
      const count = await db.fastingSessions
        .where("status")
        .equals("completed")
        .count();
      return count >= 1;
    },
  },
  {
    type: "week_warrior",
    name: "Week Warrior",
    icon: "🗓️",
    description: "Achieve a fasting streak of 7 days.",
    check: async () => {
      const streak = await db.streaks.where("type").equals("fasting").first();
      return (streak?.longestCount ?? 0) >= 7;
    },
  },
  {
    type: "month_master",
    name: "Month Master",
    icon: "📅",
    description: "Achieve a fasting streak of 30 days.",
    check: async () => {
      const streak = await db.streaks.where("type").equals("fasting").first();
      return (streak?.longestCount ?? 0) >= 30;
    },
  },
  {
    type: "century",
    name: "Century",
    icon: "💯",
    description: "Complete 100 fasting sessions.",
    check: async () => {
      const count = await db.fastingSessions
        .where("status")
        .equals("completed")
        .count();
      return count >= 100;
    },
  },
  {
    type: "hydro_start",
    name: "Hydro Start",
    icon: "💧",
    description: "Achieve your first hydration streak day.",
    check: async () => {
      const streak = await db.streaks.where("type").equals("hydration").first();
      return (streak?.longestCount ?? 0) >= 1;
    },
  },
  {
    type: "hydro_habit",
    name: "Hydro Habit",
    icon: "🌊",
    description: "Achieve a hydration streak of 7 days.",
    check: async () => {
      const streak = await db.streaks.where("type").equals("hydration").first();
      return (streak?.longestCount ?? 0) >= 7;
    },
  },
  {
    type: "extended",
    name: "Extended Fast",
    icon: "⏳",
    description: "Complete a fast lasting 20 hours or more.",
    check: async () => {
      const twentyHoursMs = 20 * 60 * 60 * 1000;
      const sessions = await db.fastingSessions
        .where("status")
        .equals("completed")
        .toArray();
      return sessions.some(
        (s) =>
          s.endTime != null &&
          s.endTime.getTime() - s.startTime.getTime() >= twentyHoursMs
      );
    },
  },
  {
    type: "early_bird",
    name: "Early Bird",
    icon: "🐦",
    description: "Start a fast before 8 PM.",
    check: async () => {
      const sessions = await db.fastingSessions
        .where("status")
        .equals("completed")
        .toArray();
      return sessions.some((s) => s.startTime.getHours() < 20);
    },
  },
  {
    type: "protocol_explorer",
    name: "Protocol Explorer",
    icon: "🔭",
    description: "Complete fasts using 3 different protocols.",
    check: async () => {
      const sessions = await db.fastingSessions
        .where("status")
        .equals("completed")
        .toArray();
      const uniqueProtocols = new Set(sessions.map((s) => s.protocol));
      return uniqueProtocols.size >= 3;
    },
  },
];

export async function evaluateBadges(): Promise<Badge[]> {
  const earnedBadges = await db.badges.toArray();
  const earnedTypes = new Set(earnedBadges.map((b) => b.type));

  const newBadges: Badge[] = [];

  for (const definition of BADGE_DEFINITIONS) {
    if (earnedTypes.has(definition.type)) {
      continue;
    }

    const qualified = await definition.check();
    if (qualified) {
      const badge: Badge = {
        type: definition.type,
        name: definition.name,
        description: definition.description,
        earnedAt: new Date(),
      };
      await db.badges.add(badge);
      newBadges.push(badge);
    }
  }

  return newBadges;
}
