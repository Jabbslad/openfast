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
    await startFast(profile.selectedProtocol);
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
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-[#0f0f1a] to-[#1a1a2e]">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const protocolId = profile?.selectedProtocol ?? "16:8";
  const protocol = getProtocol(protocolId);
  const targetMs = getTargetDurationMs(protocolId);
  const isActive = !!activeFast;
  const percentage = targetMs > 0 ? Math.min(Math.round((elapsedMs / targetMs) * 100), 100) : 0;

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-[#0f0f1a] to-[#1a1a2e] px-6 py-8">
      {protocol && (
        <span className="bg-indigo-500/20 text-indigo-400 px-4 py-1 rounded-full text-sm mb-6">
          {protocol.name} Protocol
        </span>
      )}

      <ProgressRing elapsedMs={isActive ? elapsedMs : 0} targetMs={targetMs} />

      {isActive && (
        <div className="mt-4 text-center">
          <div className="text-green-400 text-sm font-medium">{percentage}% complete</div>
          <div className="text-gray-500 text-xs mt-1">Started at {formatTime(activeFast!.startTime)}</div>
        </div>
      )}

      <div className="mt-8">
        {isActive ? (
          <button onClick={handleEnd}
            className="bg-red-500 text-white px-10 py-3 rounded-3xl font-semibold text-lg min-h-[44px] active:scale-95 transition-transform">
            End Fast
          </button>
        ) : (
          <button onClick={handleStart}
            className="bg-indigo-500 text-white px-10 py-3 rounded-3xl font-semibold text-lg min-h-[44px] active:scale-95 transition-transform">
            Start Fast
          </button>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-[#2a2a4a] w-full max-w-xs text-center">
        <span className="text-gray-500 text-sm">{streakCount} day streak</span>
      </div>
    </div>
  );
}
