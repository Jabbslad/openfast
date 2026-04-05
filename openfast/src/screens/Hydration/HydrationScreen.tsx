import { useState, useEffect, useCallback, useRef } from "react";
import { db } from "../../db/database";
import type { HydrationEntry, UserProfile } from "../../types";
import { getStartOfDay, getEndOfDay, formatTime } from "../../utils/time";
import { evaluateHydrationStreak } from "../../hooks/useStreaks";
import { evaluateBadges } from "../../hooks/useBadges";
import { WaterTumbler } from "../../components/WaterTumbler";

export function HydrationScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [screenVisible, setScreenVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
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

  // Detect when this screen scrolls into view (for entrance animation)
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => setScreenVisible(entry.isIntersecting),
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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
  const percentage = Math.min(Math.round((totalMl / goal) * 100), 100);
  const goalReached = totalMl >= goal;

  return (
    <div ref={containerRef} className="flex-1 bg-transparent px-4 py-6 overflow-y-auto">
      {/* Water tumbler */}
      <div className="mb-4">
        <WaterTumbler fillPercent={percentage} size={160} visible={screenVisible} goalReached={goalReached} />
      </div>

      {/* Goal display */}
      <div className="text-center mb-2">
        <div className="text-xs text-gray-500 uppercase tracking-widest font-medium mb-2">Daily Goal</div>
        <div className="text-3xl font-bold text-cyan-400">
          {totalMl.toLocaleString("en-US")}
          <span className="text-base font-normal text-gray-500 ml-1">/ {goal.toLocaleString("en-US")} ml</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mx-auto max-w-[260px] mb-6">
        <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${percentage}%`,
              background: goalReached
                ? "linear-gradient(90deg, #4ade80, #22d3ee)"
                : "linear-gradient(90deg, #0ea5e9, #38bdf8)",
              boxShadow: `0 0 12px ${goalReached ? "rgba(74,222,128,0.3)" : "rgba(56,189,248,0.3)"}`,
            }}
          />
        </div>
      </div>

      {/* Water drops visual */}
      <div className="flex justify-center gap-2 flex-wrap max-w-[240px] mx-auto mb-8">
        {Array.from({ length: dropCount }, (_, i) => (
          <span
            key={i}
            className="text-2xl transition-opacity duration-300"
            style={{ opacity: i < filledDrops ? 1 : 0.15 }}
          >
            💧
          </span>
        ))}
      </div>

      {/* Quick add buttons */}
      <div className="flex justify-center gap-3 mb-8">
        <button onClick={() => addWater(250)} aria-label="+ 250 ml"
          className="bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 px-5 py-2.5 rounded-full text-sm min-h-[44px] hover:bg-cyan-400/15 active:scale-95 transition-all duration-200">
          + 250 ml
        </button>
        <button onClick={() => addWater(500)} aria-label="+ 500 ml"
          className="bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 px-5 py-2.5 rounded-full text-sm min-h-[44px] hover:bg-cyan-400/15 active:scale-95 transition-all duration-200">
          + 500 ml
        </button>
      </div>

      {/* Today's log */}
      <div>
        {entries.map((entry) => (
          <div key={entry.id} className="flex justify-between items-center py-2.5 border-b border-white/[0.06] text-sm">
            <span className="text-gray-500">{formatTime(entry.timestamp)}</span>
            <div className="flex items-center gap-3">
              <span className="text-gray-300">{entry.amountMl} ml</span>
              <button onClick={() => deleteEntry(entry.id!)} aria-label="Delete entry"
                className="text-gray-700 hover:text-red-400 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18" /><path d="M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
