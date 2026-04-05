import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { TabBar } from "./components/TabBar";
import { UpdatePrompt } from "./components/UpdatePrompt";
import { InstallPrompt } from "./components/InstallPrompt";
import { TimerScreen } from "./screens/Timer/TimerScreen";
import { HydrationScreen } from "./screens/Hydration/HydrationScreen";
import { ProgressScreen } from "./screens/Progress/ProgressScreen";
import { SettingsScreen } from "./screens/Settings/SettingsScreen";
import { TipsGuides } from "./screens/Settings/TipsGuides";
import { db } from "./db/database";

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function init() {
      const existing = await db.userProfile.count();
      if (existing === 0) {
        await db.userProfile.add({
          selectedProtocol: "16:8",
          dailyWaterGoalMl: 2500,
          createdAt: new Date(),
        });
      }
      setReady(true);
    }
    init();
  }, []);

  if (!ready) {
    return (
      <div className="flex-1 flex items-center justify-center bg-navy-900">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <UpdatePrompt />
      <InstallPrompt />
      <div className="flex flex-col h-[100dvh] bg-navy-900 text-white overflow-hidden">
        <main className="flex-1 flex flex-col overflow-hidden">
          <Routes>
            <Route path="/" element={<TimerScreen />} />
            <Route path="/hydration" element={<HydrationScreen />} />
            <Route path="/progress" element={<ProgressScreen />} />
            <Route path="/settings" element={<SettingsScreen />} />
            <Route path="/settings/guides" element={<TipsGuides />} />
          </Routes>
        </main>
        <TabBar />
      </div>
    </BrowserRouter>
  );
}
