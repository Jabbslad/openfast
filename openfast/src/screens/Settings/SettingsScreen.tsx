import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../db/database";
import { PROTOCOLS } from "../../utils/protocols";
import { exportAllData, importAllData, clearAllData } from "../../db/export-import";
import { isSupported as notificationsSupported, requestPermission, sendNotification } from "../../utils/notifications";
import { ZONE_NOTIFICATIONS } from "../../content/zone-notifications";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import type { UserProfile } from "../../types";

const VERSION = "0.1.0";

export function SettingsScreen() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showProtocolPicker, setShowProtocolPicker] = useState(false);
  const [showWaterGoal, setShowWaterGoal] = useState(false);
  const [waterGoalInput, setWaterGoalInput] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [notifStatus, setNotifStatus] = useState<"granted" | "prompt" | "denied" | "not-installed" | "unsupported">("prompt");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isInstalledPwa = window.matchMedia("(display-mode: standalone)").matches
    || (navigator as unknown as { standalone?: boolean }).standalone === true;

  useEffect(() => {
    if (!notificationsSupported()) {
      setNotifStatus(isInstalledPwa ? "unsupported" : "not-installed");
    } else {
      setNotifStatus(Notification.permission === "granted" ? "granted" : Notification.permission === "denied" ? "denied" : "prompt");
    }
  }, [isInstalledPwa]);

  async function handleNotificationToggle() {
    if (notifStatus === "not-installed" || notifStatus === "unsupported") return;
    const result = await requestPermission();
    setNotifStatus(result === "granted" ? "granted" : result === "denied" ? "denied" : "prompt");
  }

  useEffect(() => {
    async function load() {
      const p = await db.userProfile.toCollection().first();
      setProfile(p ?? null);
      setLoading(false);
    }
    load();
  }, []);

  async function updateProtocol(protocolId: string) {
    if (!profile?.id) return;
    await db.userProfile.update(profile.id, { selectedProtocol: protocolId });
    setProfile((prev) => prev ? { ...prev, selectedProtocol: protocolId } : prev);
    setShowProtocolPicker(false);
  }

  async function updateWaterGoal() {
    if (!profile?.id) return;
    const ml = parseInt(waterGoalInput, 10);
    if (isNaN(ml) || ml <= 0) return;
    await db.userProfile.update(profile.id, { dailyWaterGoalMl: ml });
    setProfile((prev) => prev ? { ...prev, dailyWaterGoalMl: ml } : prev);
    setShowWaterGoal(false);
  }

  async function handleExport() {
    const data = await exportAllData();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "openfast-backup.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await importAllData(data, "replace");
      const p = await db.userProfile.toCollection().first();
      setProfile(p ?? null);
    } catch {
      // silently ignore parse/import errors in this context
    }
    e.target.value = "";
  }

  async function handleClearConfirmed() {
    await clearAllData();
    setProfile(null);
    setShowClearConfirm(false);
  }

  if (loading) {
    return (
      <div className="flex-1 bg-gradient-to-br from-[#0f0f1a] to-[#1a1a2e] flex items-center justify-center">
        <p className="text-gray-600 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gradient-to-br from-[#0f0f1a] to-[#1a1a2e] overflow-y-auto p-4">
      {/* Fasting Section */}
      <SectionHeader label="Fasting" />
      <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl overflow-hidden divide-y divide-white/[0.06] mb-6">
        <SettingsRow
          label="Fasting Protocol"
          value={profile?.selectedProtocol ?? "\u2014"}
          valueColor="text-indigo-400"
          onPress={() => setShowProtocolPicker(true)}
        />
        {notifStatus === "not-installed" ? (
          <div className="px-4 py-3.5">
            <span className="text-white text-sm">Notifications</span>
            <p className="text-gray-500 text-xs mt-1">Install this app to your Home Screen to enable notifications</p>
          </div>
        ) : notifStatus === "unsupported" ? (
          <div className="px-4 py-3.5">
            <span className="text-white text-sm">Notifications</span>
            <p className="text-gray-500 text-xs mt-1">Not supported on this device</p>
          </div>
        ) : (
          <>
            <SettingsRow
              label="Notifications"
              value={notifStatus === "granted" ? "On" : notifStatus === "denied" ? "Enable in Settings" : "Off"}
              valueColor={notifStatus === "granted" ? "text-green-400" : undefined}
              onPress={handleNotificationToggle}
            />
            {notifStatus === "granted" && (
              <SettingsRow
                label="Test Notification"
                onPress={() => {
                  const notif = ZONE_NOTIFICATIONS.fat_burning;
                  sendNotification(notif.title, notif.body);
                }}
              />
            )}
          </>
        )}
      </div>

      {/* Hydration Section */}
      <SectionHeader label="Hydration" />
      <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl overflow-hidden divide-y divide-white/[0.06] mb-6">
        <SettingsRow
          label="Daily Water Goal"
          value={profile ? `${profile.dailyWaterGoalMl.toLocaleString()} ml` : "\u2014"}
          onPress={() => {
            setWaterGoalInput(String(profile?.dailyWaterGoalMl ?? ""));
            setShowWaterGoal(true);
          }}
        />
      </div>

      {/* Data Section */}
      <SectionHeader label="Data" />
      <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl overflow-hidden divide-y divide-white/[0.06] mb-6">
        <SettingsRow label="Export Data" value="JSON" onPress={handleExport} />
        <SettingsRow label="Import Data" onPress={handleImportClick} />
        <SettingsRow label="Clear All Data" onPress={() => setShowClearConfirm(true)} destructive />
      </div>

      {/* About Section */}
      <SectionHeader label="About" />
      <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl overflow-hidden divide-y divide-white/[0.06] mb-6">
        <SettingsRow
          label="Tips & Guides"
          onPress={() => navigate("/settings/guides")}
        />
        <SettingsRow
          label="Check for Updates"
          onPress={async () => {
            if ("serviceWorker" in navigator) {
              const regs = await navigator.serviceWorker.getRegistrations();
              for (const reg of regs) await reg.unregister();
            }
            if ("caches" in window) {
              const keys = await caches.keys();
              for (const key of keys) await caches.delete(key);
            }
            window.location.href = import.meta.env.BASE_URL;
          }}
        />
        <div className="flex items-center justify-between px-4 py-3.5">
          <span className="text-white text-sm">Version</span>
          <span className="text-gray-500 text-sm">{VERSION}</span>
        </div>
      </div>

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={handleImportFile}
      />

      {/* Protocol Picker Modal */}
      {showProtocolPicker && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setShowProtocolPicker(false)}
        >
          <div
            className="bg-[#1a1a2e] border-t border-white/[0.08] rounded-t-2xl w-full max-w-md p-4 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-white text-lg font-semibold mb-4">Select Protocol</h2>
            <div className="flex flex-col divide-y divide-white/[0.06]">
              {PROTOCOLS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => updateProtocol(p.id)}
                  className="flex items-center justify-between py-3 text-white text-sm hover:bg-white/[0.04] px-2 rounded transition-colors"
                >
                  <span>
                    {p.name}
                    <span className="text-gray-500 ml-2 text-xs">({p.category})</span>
                  </span>
                  {profile?.selectedProtocol === p.id && (
                    <span className="text-indigo-400">&#10003;</span>
                  )}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowProtocolPicker(false)}
              className="mt-4 w-full py-3 rounded-xl bg-white/[0.06] text-gray-300 text-sm hover:bg-white/[0.1] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Water Goal Modal */}
      {showWaterGoal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setShowWaterGoal(false)}
        >
          <div
            className="bg-[#1a1a2e] border border-white/[0.08] rounded-2xl p-6 w-full max-w-sm mx-4 flex flex-col gap-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-white text-lg font-semibold">Daily Water Goal</h2>
            <div className="flex flex-col gap-1.5">
              <label className="text-gray-500 text-xs font-medium">Amount in ml</label>
              <input
                type="number"
                value={waterGoalInput}
                onChange={(e) => setWaterGoalInput(e.target.value)}
                className="bg-[#0f0f1a] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-colors"
                placeholder="2500"
                min={100}
                max={10000}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowWaterGoal(false)}
                className="px-5 py-2.5 rounded-xl text-sm text-gray-300 bg-white/[0.06] hover:bg-white/[0.1] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={updateWaterGoal}
                className="px-5 py-2.5 rounded-xl text-sm text-white bg-indigo-500 hover:bg-indigo-400 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Confirm Dialog */}
      <ConfirmDialog
        open={showClearConfirm}
        title="Clear All Data"
        message="This will permanently delete all your fasting sessions, meal logs, hydration entries, and settings. This action cannot be undone."
        confirmLabel="Clear All"
        confirmValue="DELETE"
        onConfirm={handleClearConfirmed}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <p className="text-gray-500 text-[11px] font-semibold uppercase tracking-widest mb-2 px-1">
      {label}
    </p>
  );
}

interface SettingsRowProps {
  label: string;
  value?: string;
  valueColor?: string;
  onPress: () => void;
  destructive?: boolean;
}

function SettingsRow({ label, value, valueColor, onPress, destructive }: SettingsRowProps) {
  return (
    <button
      type="button"
      onClick={onPress}
      className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/[0.03] transition-colors"
    >
      <span className={`text-sm ${destructive ? "text-red-400" : "text-white"}`}>
        {label}
      </span>
      <span className="flex items-center gap-1.5">
        {value && <span className={`text-sm ${valueColor || "text-gray-500"}`}>{value}</span>}
        <span className="text-gray-600 text-xs">&rsaquo;</span>
      </span>
    </button>
  );
}
