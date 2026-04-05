import { useEffect, useState } from "react";
import { SwipeNav } from "./components/SwipeNav";
import { UpdatePrompt } from "./components/UpdatePrompt";
import { InstallPrompt } from "./components/InstallPrompt";
import { LandscapeOverlay } from "./components/LandscapeOverlay";
import { OnboardingIntro } from "./components/OnboardingIntro";
import { TimerScreen } from "./screens/Timer/TimerScreen";
import { HydrationScreen } from "./screens/Hydration/HydrationScreen";
import { ProgressScreen } from "./screens/Progress/ProgressScreen";
import { SettingsScreen } from "./screens/Settings/SettingsScreen";
import { TipsGuides } from "./screens/Settings/TipsGuides";
import { db } from "./db/database";

export default function App() {
  const [ready, setReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showGuides, setShowGuides] = useState(false);

  useEffect(() => {
    async function init() {
      const existing = await db.userProfile.count();
      if (existing === 0) {
        await db.userProfile.add({
          selectedProtocol: "16:8",
          dailyWaterGoalMl: 2500,
          createdAt: new Date(),
        });
        setShowOnboarding(true);
      }
      setReady(true);
    }
    init();
  }, []);

  async function handleOnboardingComplete() {
    const profile = await db.userProfile.toCollection().first();
    if (profile?.id !== undefined) {
      await db.userProfile.update(profile.id, { onboardingCompleted: true });
    }
    setShowOnboarding(false);
  }

  if (!ready) {
    return (
      <div className="flex-1 flex items-center justify-center bg-navy-900">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {showOnboarding && <OnboardingIntro onComplete={handleOnboardingComplete} />}
      <UpdatePrompt />
      <InstallPrompt />
      <LandscapeOverlay />
      <div className="h-full bg-navy-900 text-white overflow-hidden">
        <SwipeNav initialIndex={1} onSettingsTap={() => setShowSettings(true)}>
          <HydrationScreen />
          <TimerScreen />
          <ProgressScreen />
        </SwipeNav>
      </div>

      {/* Settings as full-screen overlay */}
      {showSettings && (
        <div className="fixed inset-0 z-50 bg-[#0f0f1a] flex flex-col overflow-hidden">
          <div className="shrink-0 pt-[env(safe-area-inset-top,0px)] px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => setShowSettings(false)}
              className="text-indigo-400 text-sm font-medium min-h-[44px] flex items-center"
            >
              &larr; Back
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <SettingsScreen onNavigateGuides={() => { setShowSettings(false); setShowGuides(true); }} />
          </div>
        </div>
      )}

      {/* Tips & Guides overlay */}
      {showGuides && (
        <div className="fixed inset-0 z-50 bg-[#0f0f1a] flex flex-col overflow-hidden">
          <div className="shrink-0 pt-[env(safe-area-inset-top,0px)] px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => { setShowGuides(false); setShowSettings(true); }}
              className="text-indigo-400 text-sm font-medium min-h-[44px] flex items-center"
            >
              &larr; Settings
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <TipsGuides />
          </div>
        </div>
      )}
    </>
  );
}
