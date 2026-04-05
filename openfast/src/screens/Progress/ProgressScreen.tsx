import { useEffect, useState } from "react";
import { db } from "../../db/database";
import { deleteFast } from "../../hooks/useFastingTimer";
import { BADGE_DEFINITIONS } from "../../hooks/useBadges";
import { formatDuration, isSameDay } from "../../utils/time";
import { FastDetailSheet } from "../../components/FastDetailSheet";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { canShare, shareStreak } from "../../utils/share";
import type { Badge, FastingSession, Streak } from "../../types";

interface WeeklyCalendarProps {
  sessions: FastingSession[];
}

function WeeklyCalendar({ sessions }: WeeklyCalendarProps) {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon ...
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  return (
    <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-4 mb-5">
      <h3 className="text-white text-sm font-medium mb-3">This Week</h3>
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
            circleClass += "bg-green-500/80 text-white";
          } else if (activeSession) {
            circleClass += "bg-indigo-500/80 text-white";
          } else if (isToday) {
            circleClass += "bg-white/[0.06] text-gray-200 ring-1.5 ring-indigo-400/50";
          } else {
            circleClass += "bg-white/[0.04] text-gray-500";
          }

          return (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <span className="text-gray-500 text-[10px] font-medium">{days[i]}</span>
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
  const [selectedSession, setSelectedSession] = useState<FastingSession | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  function handleSessionTap(session: FastingSession) {
    setSelectedSession(session);
    setDetailOpen(true);
  }

  function handleDeleteRequest() {
    setDetailOpen(false);
    setTimeout(() => setShowDeleteConfirm(true), 300);
  }

  async function handleDeleteConfirm() {
    if (!selectedSession?.id) return;
    await deleteFast(selectedSession.id);
    setHistory((prev) => prev.filter((s) => s.id !== selectedSession.id));
    setTotalFasts((prev) => prev - 1);
    setSelectedSession(null);
    setShowDeleteConfirm(false);
  }

  return (
    <div className="flex-1 bg-gradient-to-br from-[#0f0f1a] to-[#1a1a2e] text-white p-4 overflow-y-auto">
      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <button
          type="button"
          onClick={() => {
            const count = fastingStreak?.currentCount ?? 0;
            if (canShare() && count > 0) shareStreak(count);
          }}
          className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-4 flex flex-col items-center"
        >
          <span className="text-orange-400 text-3xl font-bold">
            {loading ? "\u2014" : (fastingStreak?.currentCount ?? 0)}
          </span>
          <span className="text-gray-500 text-[10px] font-medium mt-1.5 text-center uppercase tracking-wider">Fasting Streak</span>
          {canShare() && (fastingStreak?.currentCount ?? 0) > 0 && (
            <span className="text-gray-600 text-[9px] mt-1">Tap to share</span>
          )}
        </button>
        <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-4 flex flex-col items-center">
          <span className="text-cyan-400 text-3xl font-bold">
            {loading ? "\u2014" : (hydrationStreak?.currentCount ?? 0)}
          </span>
          <span className="text-gray-500 text-[10px] font-medium mt-1.5 text-center uppercase tracking-wider">Hydration Streak</span>
        </div>
        <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-4 flex flex-col items-center">
          <span className="text-indigo-400 text-3xl font-bold">
            {loading ? "\u2014" : totalFasts}
          </span>
          <span className="text-gray-500 text-[10px] font-medium mt-1.5 text-center uppercase tracking-wider">Total Fasts</span>
        </div>
      </div>

      {/* Weekly Calendar */}
      {!loading && <WeeklyCalendar sessions={history} />}

      {/* Badges */}
      <div className="mb-6">
        <h2 className="text-sm font-medium text-white mb-3">Badges</h2>
        <div className="grid grid-cols-3 gap-2.5">
          {BADGE_DEFINITIONS.map((def) => {
            const earned = earnedBadgeTypes.has(def.type);
            return (
              <div
                key={def.type}
                className={`rounded-2xl p-3 flex flex-col items-center text-center transition-opacity ${
                  earned
                    ? "bg-white/[0.04] border border-white/[0.08]"
                    : "bg-white/[0.02] border border-dashed border-white/[0.06] opacity-30"
                }`}
              >
                <span className="text-2xl mb-1">{def.icon}</span>
                <span className="text-[10px] font-semibold text-white leading-tight">{def.name}</span>
                <span className="text-[10px] text-gray-500 mt-0.5 leading-tight">{def.description}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* History */}
      <div>
        <h2 className="text-sm font-medium text-white mb-3">History</h2>
        {history.length === 0 ? (
          <p className="text-gray-600 text-sm">No completed fasts yet.</p>
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
                <button
                  key={session.id ?? i}
                  type="button"
                  onClick={() => handleSessionTap(session)}
                  className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-3.5 flex items-center justify-between w-full text-left hover:bg-white/[0.06] transition-colors"
                >
                  <div>
                    <span className="text-white font-medium text-sm">{session.protocol}</span>
                    <p className="text-gray-500 text-xs mt-0.5">{dateStr}</p>
                  </div>
                  <span className="text-gray-400 text-sm font-mono tracking-wide">
                    {formatDuration(durationMs)}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <FastDetailSheet
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        session={selectedSession}
        onDelete={handleDeleteRequest}
      />

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete Fast"
        message="This will permanently remove this fast from your history. This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
