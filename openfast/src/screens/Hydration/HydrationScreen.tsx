import { useState, useEffect, useCallback } from "react";
import { db } from "../../db/database";
import type { HydrationEntry, UserProfile } from "../../types";
import { getStartOfDay, getEndOfDay, formatTime } from "../../utils/time";
import { evaluateHydrationStreak } from "../../hooks/useStreaks";
import { evaluateBadges } from "../../hooks/useBadges";

export function HydrationScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [entries, setEntries] = useState<HydrationEntry[]>([]);

  const totalMl = entries.reduce((sum, e) => sum + e.amountMl, 0);

  const loadData = useCallback(async () => {
    const [p, todayEntries] = await Promise.all([
      db.userProfile.toCollection().first(),
      db.hydrationEntries
        .where("timestamp")
        .between(getStartOfDay(new Date()), getEndOfDay(new Date()), true, true)
        .toArray(),
    ]);
    setProfile(p ?? null);
    setEntries(todayEntries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addWater = async (amountMl: number) => {
    const now = new Date();
    await db.hydrationEntries.add({ timestamp: now, amountMl });
    await evaluateHydrationStreak(now);
    await evaluateBadges();
    await loadData();
  };

  const deleteEntry = async (id: number) => {
    await db.hydrationEntries.delete(id);
    await loadData();
  };

  const goal = profile?.dailyWaterGoalMl ?? 2000;
  const dropCount = Math.ceil(goal / 250);
  const filledDrops = Math.floor(totalMl / 250);

  return (
    <div className="flex-1 bg-gradient-to-br from-[#0f0f1a] to-[#1a1a2e] px-4 py-6 overflow-y-auto">
      <div className="text-center mb-6">
        <div className="text-sm text-gray-500">Daily Goal</div>
        <div className="text-3xl font-bold text-cyan-400">
          {totalMl.toLocaleString("en-US")}
          <span className="text-base text-gray-500"> / {goal.toLocaleString("en-US")} ml</span>
        </div>
      </div>

      <div className="flex justify-center gap-1.5 flex-wrap max-w-[240px] mx-auto mb-6">
        {Array.from({ length: dropCount }, (_, i) => (
          <span key={i} className="text-2xl" style={{ opacity: i < filledDrops ? 1 : 0.3 }}>💧</span>
        ))}
      </div>

      <div className="flex justify-center gap-3 mb-6">
        <button onClick={() => addWater(250)} aria-label="+ 250 ml"
          className="bg-cyan-400/15 border border-cyan-400/30 text-cyan-400 px-5 py-2.5 rounded-full text-sm min-h-[44px]">+ 250 ml</button>
        <button onClick={() => addWater(500)} aria-label="+ 500 ml"
          className="bg-cyan-400/15 border border-cyan-400/30 text-cyan-400 px-5 py-2.5 rounded-full text-sm min-h-[44px]">+ 500 ml</button>
      </div>

      <div className="space-y-0">
        {entries.map((entry) => (
          <div key={entry.id} className="flex justify-between items-center py-2 border-b border-[#2a2a4a] text-sm">
            <span className="text-gray-500">{formatTime(entry.timestamp)}</span>
            <div className="flex items-center gap-3">
              <span>{entry.amountMl} ml</span>
              <button onClick={() => deleteEntry(entry.id!)} aria-label="Delete entry"
                className="text-red-400 min-w-[44px] min-h-[44px] flex items-center justify-center">✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
