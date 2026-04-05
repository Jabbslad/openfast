import { useState, useEffect, useRef } from "react";
import { ProgressRing } from "../../components/ProgressRing";
import { startFast, endFast, cancelFast, getActiveFast, updateFastStartTime } from "../../hooks/useFastingTimer";
import { evaluateFastingStreak, getStreak } from "../../hooks/useStreaks";
import { evaluateBadges } from "../../hooks/useBadges";
import { getProtocol, getTargetDurationMs } from "../../utils/protocols";
import { sendNotification, requestPermission } from "../../utils/notifications";
import { formatTime, formatDuration } from "../../utils/time";
import { getZoneForElapsedMs } from "../../utils/zones";
import { ZONE_NOTIFICATIONS } from "../../content/zone-notifications";
import { setBadge, clearBadge } from "../../utils/badge";
import { shareFastResult } from "../../utils/share";
import { ZoneTimeline } from "../../components/ZoneTimeline";
import { ZoneExplorer } from "../../components/ZoneExplorer";
import { EditStartTimeSheet } from "../../components/EditStartTimeSheet";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { SlideToEnd } from "../../components/SlideToEnd";
import { db } from "../../db/database";
import type { FastingSession, UserProfile } from "../../types";

export function TimerScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeFast, setActiveFast] = useState<FastingSession | undefined>(undefined);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [streakCount, setStreakCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const notifiedRef = useRef(false);
  const lastZoneRef = useRef<string | null>(null);

  const [explorerOpen, setExplorerOpen] = useState(false);
  const [explorerInitialZone, setExplorerInitialZone] = useState<string | undefined>();
  const [editStartOpen, setEditStartOpen] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);

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
      sendNotification("\ud83c\udfaf Goal Reached!", `You've completed your ${activeFast.protocol} fast! Incredible work.`);
    }
  }, [elapsedMs, activeFast, profile]);

  // Send notification on zone transitions
  useEffect(() => {
    if (!activeFast || elapsedMs === 0) return;
    const currentZone = getZoneForElapsedMs(elapsedMs);
    if (lastZoneRef.current && lastZoneRef.current !== currentZone.id) {
      const notif = ZONE_NOTIFICATIONS[currentZone.id];
      if (notif) {
        sendNotification(notif.title, notif.body);
      }
    }
    lastZoneRef.current = currentZone.id;
  }, [elapsedMs, activeFast]);

  // Update app badge when fasting (shows elapsed hours)
  const badgeHours = activeFast ? Math.floor(elapsedMs / 3_600_000) : -1;
  useEffect(() => {
    if (badgeHours >= 0) {
      setBadge(Math.max(badgeHours, 1));
    } else {
      clearBadge();
    }
  }, [badgeHours]);

  async function handleStart() {
    if (!profile) return;
    // Request notification permission on first fast start
    await requestPermission();
    await startFast(profile.selectedProtocol);
    const fast = await getActiveFast();
    setActiveFast(fast);
    setElapsedMs(0);
    notifiedRef.current = false;
    lastZoneRef.current = null;
  }

  async function handleEnd() {
    if (!activeFast?.id) return;
    const finalElapsed = elapsedMs;
    const finalZone = getZoneForElapsedMs(finalElapsed);
    const finalProtocol = activeFast.protocol;
    await endFast(activeFast.id);
    await evaluateFastingStreak(new Date());
    await evaluateBadges();
    const streak = await getStreak("fasting");
    setStreakCount(streak?.currentCount ?? 0);
    setActiveFast(undefined);
    setElapsedMs(0);
    notifiedRef.current = false;
    lastZoneRef.current = null;

    // Offer to share the result
    const shared = await shareFastResult({
      protocol: finalProtocol,
      durationLabel: formatDuration(finalElapsed),
      zone: finalZone.name,
    });
    if (shared) {
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2000);
    }
  }

  async function handleCancel() {
    if (!activeFast?.id) return;
    await cancelFast(activeFast.id);
    setActiveFast(undefined);
    setElapsedMs(0);
    setShowCancelConfirm(false);
    notifiedRef.current = false;
  }

  async function handleUpdateStartTime(newStartTime: Date) {
    if (!activeFast?.id) return;
    await updateFastStartTime(activeFast.id, newStartTime);
    setActiveFast({ ...activeFast, startTime: newStartTime });
    setElapsedMs(Date.now() - newStartTime.getTime());
    setEditStartOpen(false);
  }

  function openExplorer(zoneId?: string) {
    setExplorerInitialZone(zoneId);
    setExplorerOpen(true);
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-[#0f0f1a] to-[#1a1a2e]">
        <div className="text-gray-600 text-sm">Loading...</div>
      </div>
    );
  }

  const protocolId = profile?.selectedProtocol ?? "16:8";
  const protocol = getProtocol(protocolId);
  const targetMs = getTargetDurationMs(protocolId);
  const isActive = !!activeFast;
  const zone = isActive ? getZoneForElapsedMs(elapsedMs) : null;

  return (
    <div className="flex-1 flex flex-col items-center bg-gradient-to-br from-[#0f0f1a] to-[#1a1a2e] px-6 py-[env(safe-area-inset-top)]">
      {/* Top spacer — pushes ring down from the top */}
      <div className="flex-[2]" />

      <ProgressRing
        elapsedMs={isActive ? elapsedMs : 0}
        targetMs={targetMs}
        size={300}
        zoneColor={zone?.color}
        zoneGlowColor={zone?.glowColor}
        protocolName={protocol?.name}
        streakCount={streakCount}
      />

      {/* Middle spacer — separates ring from controls */}
      <div className="flex-[1]" />

      {isActive ? (
        <>
          <ZoneTimeline elapsedMs={elapsedMs} onZoneTap={(id) => openExplorer(id)} />

          {/* Spacer — pushes controls to the bottom */}
          <div className="flex-1" />

          {/* Slide to end */}
          <div className="w-full max-w-sm px-2">
            <SlideToEnd onComplete={handleEnd} goalReached={elapsedMs >= targetMs && targetMs > 0} />
          </div>

          {/* Started-at — quiet metadata docked above tab bar */}
          <button
            onClick={() => setEditStartOpen(true)}
            className="mt-3 mb-2 inline-flex items-center gap-1.5 px-3 py-2 rounded-full min-h-[44px] text-gray-600 text-xs hover:text-gray-400 transition-colors"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5z" />
            </svg>
            Started at {formatTime(activeFast!.startTime)}
          </button>
        </>
      ) : (
        <div className="flex flex-col items-center gap-3 mb-6">
          <button onClick={handleStart}
            className="bg-indigo-500 hover:bg-indigo-400 text-white px-14 py-4 rounded-full font-semibold text-lg min-h-[52px] active:scale-95 transition-all duration-200 shadow-lg shadow-indigo-500/25">
            Start Fast
          </button>
          <button
            onClick={() => openExplorer()}
            className="text-indigo-400 text-sm font-medium hover:text-indigo-300 transition-colors"
          >
            Explore Fasting Zones &rarr;
          </button>
        </div>
      )}

      <ZoneExplorer
        open={explorerOpen}
        onClose={() => setExplorerOpen(false)}
        currentZoneId={zone?.id}
        initialZoneId={explorerInitialZone}
        elapsedMs={isActive ? elapsedMs : undefined}
      />

      {activeFast && (
        <EditStartTimeSheet
          open={editStartOpen}
          onClose={() => setEditStartOpen(false)}
          currentStartTime={activeFast.startTime}
          onSave={handleUpdateStartTime}
          onDiscard={() => {
            setEditStartOpen(false);
            setTimeout(() => setShowCancelConfirm(true), 300);
          }}
        />
      )}

      <ConfirmDialog
        open={showCancelConfirm}
        title="Discard Fast"
        message="This fast won't be counted toward your streak or history."
        confirmLabel="Discard"
        onConfirm={handleCancel}
        onCancel={() => setShowCancelConfirm(false)}
      />

      {showShareToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl bg-green-600 text-white text-sm font-medium shadow-lg">
          Shared!
        </div>
      )}
    </div>
  );
}
