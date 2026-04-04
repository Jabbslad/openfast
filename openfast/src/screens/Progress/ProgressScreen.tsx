import { useEffect, useState } from "react";
import { db } from "../../db/database";
import { BADGE_DEFINITIONS } from "../../hooks/useBadges";
import { formatDuration, isSameDay } from "../../utils/time";
import type { Badge, FastingSession, Streak } from "../../types";

interface WeeklyCalendarProps {
  sessions: FastingSession[];
}

function WeeklyCalendar({ sessions }: WeeklyCalendarProps) {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon ...
  // Build Mon-Sun week
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  return (
    <div className="bg-gray-800 rounded-2xl p-4 mb-4">
      <h3 className="text-white text-sm font-semibold mb-3">This Week</h3>
      <div className="flex justify-between">
        {week.map((date, i) => {
          const isToday = isSameDay(date, today);
          const completedSession = sessions.find(
            (s) => s.status === "completed" && s.endTime && isSameDay(s.endTime, date)
          );
          const activeSession = sessions.find(
            (s) => s.status === "active" && isSameDay(s.startTime, date)
          );

          let circleClass = "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ";
          if (completedSession) {
            circleClass += "bg-green-500 text-white";
          } else if (activeSession) {
            circleClass += "bg-indigo-500 text-white";
          } else if (isToday) {
            circleClass += "bg-gray-600 text-gray-200 ring-2 ring-indigo-400";
          } else {
            circleClass += "bg-gray-700 text-gray-400";
          }

          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="text-gray-400 text-xs">{days[i]}</span>
              <div className={circleClass}>{date.getDate()}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ProgressScreen() {
  const [fastingStreak, setFastingStreak] = useState<Streak | null>(null);
  const [hydrationStreak, setHydrationStreak] = useState<Streak | null>(null);
  const [totalFasts, setTotalFasts] = useState(0);
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);
  const [history, setHistory] = useState<FastingSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [fasting, hydration, count, badges, completedSessions] = await Promise.all([
        db.streaks.where("type").equals("fasting").first(),
        db.streaks.where("type").equals("hydration").first(),
        db.fastingSessions.where("status").equals("completed").count(),
        db.badges.toArray(),
        db.fastingSessions
          .where("status")
          .equals("completed")
          .reverse()
          .limit(20)
          .toArray(),
      ]);
      setFastingStreak(fasting ?? null);
      setHydrationStreak(hydration ?? null);
      setTotalFasts(count);
      setEarnedBadges(badges);
      setHistory(completedSessions);
      setLoading(false);
    }
    load();
  }, []);

  const earnedBadgeTypes = new Set(earnedBadges.map((b) => b.type));

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-white p-4">
      <h1 className="text-2xl font-bold mb-6">Progress</h1>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-orange-900/50 border border-orange-700/50 rounded-2xl p-3 flex flex-col items-center">
          <span className="text-orange-400 text-2xl font-bold">
            {loading ? "—" : (fastingStreak?.currentCount ?? 0)}
          </span>
          <span className="text-orange-200 text-xs mt-1 text-center">Fasting Streak</span>
        </div>
        <div className="bg-cyan-900/50 border border-cyan-700/50 rounded-2xl p-3 flex flex-col items-center">
          <span className="text-cyan-400 text-2xl font-bold">
            {loading ? "—" : (hydrationStreak?.currentCount ?? 0)}
          </span>
          <span className="text-cyan-200 text-xs mt-1 text-center">Hydration Streak</span>
        </div>
        <div className="bg-indigo-900/50 border border-indigo-700/50 rounded-2xl p-3 flex flex-col items-center">
          <span className="text-indigo-400 text-2xl font-bold">
            {loading ? "—" : totalFasts}
          </span>
          <span className="text-indigo-200 text-xs mt-1 text-center">Total Fasts</span>
        </div>
      </div>

      {/* Weekly Calendar */}
      {!loading && <WeeklyCalendar sessions={history} />}

      {/* Badges */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Badges</h2>
        <div className="grid grid-cols-3 gap-3">
          {BADGE_DEFINITIONS.map((def) => {
            const earned = earnedBadgeTypes.has(def.type);
            return (
              <div
                key={def.type}
                className={`rounded-2xl p-3 flex flex-col items-center text-center ${
                  earned
                    ? "bg-gray-800 border border-gray-600"
                    : "bg-gray-900 border border-dashed border-gray-700 opacity-40"
                }`}
              >
                <span className="text-2xl mb-1">{def.icon}</span>
                <span className="text-xs font-semibold text-white leading-tight">{def.name}</span>
                <span className="text-xs text-gray-400 mt-1 leading-tight">{def.description}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* History */}
      <div>
        <h2 className="text-lg font-semibold mb-3">History</h2>
        {history.length === 0 ? (
          <p className="text-gray-500 text-sm">No completed fasts yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {history.map((session, i) => {
              const durationMs =
                session.endTime
                  ? session.endTime.getTime() - session.startTime.getTime()
                  : 0;
              const dateStr = session.endTime
                ? session.endTime.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : session.startTime.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });

              return (
                <div
                  key={session.id ?? i}
                  className="bg-gray-800 rounded-xl p-3 flex items-center justify-between"
                >
                  <div>
                    <span className="text-white font-medium text-sm">{session.protocol}</span>
                    <p className="text-gray-400 text-xs mt-0.5">{dateStr}</p>
                  </div>
                  <span className="text-gray-300 text-sm font-mono">
                    {formatDuration(durationMs)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
