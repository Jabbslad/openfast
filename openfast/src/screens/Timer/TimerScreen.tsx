import { useState, useEffect, useRef } from "react";
import { ProgressRing } from "../../components/ProgressRing";
import { startFast, endFast, getActiveFast } from "../../hooks/useFastingTimer";
import { evaluateFastingStreak, getStreak } from "../../hooks/useStreaks";
import { evaluateBadges } from "../../hooks/useBadges";
import { getProtocol, getTargetDurationMs } from "../../utils/protocols";
import { sendNotification } from "../../utils/notifications";
import { formatTime } from "../../utils/time";
import { db } from "../../db/database";
import type { FastingSession, UserProfile } from "../../types";

export function TimerScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeFast, setActiveFast] = useState<FastingSession | undefined>(undefined);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [streakCount, setStreakCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const notifiedRef = useRef(false);

  // Load initial state from DB
  useEffect(() => {
    async function loadState() {
      const userProfile = await db.userProfile.toCollection().first();
      const fast = await getActiveFast();
      const streak = await getStreak("fasting");

      setProfile(userProfile ?? null);
      setActiveFast(fast);
      setStreakCount(streak?.currentCount ?? 0);

      if (fast) {
        const now = Date.now();
        setElapsedMs(now - fast.startTime.getTime());
      }

      setLoading(false);
    }

    loadState();
  }, []);

  // Tick elapsed time every second when fast is active
  useEffect(() => {
    if (!activeFast) return;

    const interval = setInterval(() => {
      const now = Date.now();
      setElapsedMs(now - activeFast.startTime.getTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [activeFast]);

  // Send notification when goal is reached
  useEffect(() => {
    if (!activeFast || !profile) return;
    const targetMs = getTargetDurationMs(activeFast.protocol);
    if (targetMs > 0 && elapsedMs >= targetMs && !notifiedRef.current) {
      notifiedRef.current = true;
      sendNotification("Goal Reached!", `You've completed your ${activeFast.protocol} fast!`);
    }
  }, [elapsedMs, activeFast, profile]);

  async function handleStart() {
    if (!profile) return;
    const id = await startFast(profile.selectedProtocol);
    const fast = await getActiveFast();
    setActiveFast(fast);
    setElapsedMs(0);
    notifiedRef.current = false;
  }

  async function handleEnd() {
    if (!activeFast?.id) return;
    await endFast(activeFast.id);
    await evaluateFastingStreak(new Date());
    await evaluateBadges();
    const streak = await getStreak("fasting");
    setStreakCount(streak?.currentCount ?? 0);
    setActiveFast(undefined);
    setElapsedMs(0);
    notifiedRef.current = false;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-indigo-950 flex items-center justify-center">
        <p className="text-white text-lg">Loading...</p>
      </div>
    );
  }

  const protocolId = profile?.selectedProtocol ?? "16:8";
  const protocol = getProtocol(protocolId);
  const targetMs = getTargetDurationMs(protocolId);
  const isActive = !!activeFast;
  const goalReached = isActive && targetMs > 0 && elapsedMs >= targetMs;
  const percentage = targetMs > 0 ? Math.min(Math.round((elapsedMs / targetMs) * 100), 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-indigo-950 flex flex-col items-center justify-center gap-8 p-6">
      {/* Protocol badge */}
      <div className="px-4 py-1.5 rounded-full bg-indigo-800 text-indigo-200 text-sm font-medium">
        {protocol?.name ?? protocolId} Protocol
      </div>

      {/* Progress ring */}
      {isActive ? (
        <div className="flex flex-col items-center gap-2">
          <ProgressRing elapsedMs={elapsedMs} targetMs={targetMs} />
          <p className="text-indigo-300 text-sm">{percentage}% complete</p>
          {activeFast?.startTime && (
            <p className="text-gray-400 text-xs">
              Started at {formatTime(activeFast.startTime)}
            </p>
          )}
          {goalReached && (
            <p className="text-green-400 font-semibold text-lg">Goal Reached!</p>
          )}
        </div>
      ) : (
        <ProgressRing elapsedMs={0} targetMs={targetMs} />
      )}

      {/* Action button */}
      {isActive ? (
        <button
          onClick={handleEnd}
          className="px-8 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold text-base transition-colors"
        >
          End Fast
        </button>
      ) : (
        <button
          onClick={handleStart}
          className="px-8 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base transition-colors"
        >
          Start Fast
        </button>
      )}

      {/* Streak count */}
      <div className="text-center">
        <p className="text-gray-400 text-sm">
          Current streak:{" "}
          <span className="text-indigo-300 font-semibold">{streakCount} day{streakCount !== 1 ? "s" : ""}</span>
        </p>
      </div>
    </div>
  );
}
