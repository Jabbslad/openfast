import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../db/database";
import { PROTOCOLS } from "../../utils/protocols";
import { exportAllData, importAllData, clearAllData } from "../../db/export-import";
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

  const fileInputRef = useRef<HTMLInputElement>(null);

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
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gradient-to-br from-[#0f0f1a] to-[#1a1a2e] overflow-y-auto p-4">
      <h1 className="text-white text-2xl font-bold mb-6">Settings</h1>

      {/* Fasting Section */}
      <SectionHeader label="Fasting" />
      <div className="bg-[#1a1a2e] rounded-2xl overflow-hidden divide-y divide-[#2a2a4a] mb-6">
        <SettingsRow
          label="Fasting Protocol"
          value={profile?.selectedProtocol ?? "—"}
          onPress={() => setShowProtocolPicker(true)}
        />
      </div>

      {/* Hydration Section */}
      <SectionHeader label="Hydration" />
      <div className="bg-[#1a1a2e] rounded-2xl overflow-hidden divide-y divide-[#2a2a4a] mb-6">
        <SettingsRow
          label="Daily Water Goal"
          value={profile ? `${profile.dailyWaterGoalMl} ml` : "—"}
          onPress={() => {
            setWaterGoalInput(String(profile?.dailyWaterGoalMl ?? ""));
            setShowWaterGoal(true);
          }}
        />
      </div>

      {/* Data Section */}
      <SectionHeader label="Data" />
      <div className="bg-[#1a1a2e] rounded-2xl overflow-hidden divide-y divide-[#2a2a4a] mb-6">
        <SettingsRow label="Export Data" onPress={handleExport} />
        <SettingsRow label="Import Data" onPress={handleImportClick} />
        <SettingsRow label="Clear All Data" onPress={() => setShowClearConfirm(true)} destructive />
      </div>

      {/* About Section */}
      <SectionHeader label="About" />
      <div className="bg-[#1a1a2e] rounded-2xl overflow-hidden divide-y divide-[#2a2a4a] mb-6">
        <SettingsRow
          label="Tips & Guides"
          onPress={() => navigate("/settings/guides")}
          showChevron
        />
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-white text-sm">Version</span>
          <span className="text-gray-400 text-sm">{VERSION}</span>
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
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
          onClick={() => setShowProtocolPicker(false)}
        >
          <div
            className="bg-[#1a1a2e] rounded-t-2xl w-full max-w-md p-4 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-white text-lg font-semibold mb-4">Select Protocol</h2>
            <div className="flex flex-col divide-y divide-[#2a2a4a]">
              {PROTOCOLS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => updateProtocol(p.id)}
                  className="flex items-center justify-between py-3 text-white text-sm hover:bg-[#2a2a4a] px-2 rounded transition-colors"
                >
                  <span>
                    {p.name}
                    <span className="text-gray-400 ml-2 text-xs">({p.category})</span>
                  </span>
                  {profile?.selectedProtocol === p.id && (
                    <span className="text-indigo-400">✓</span>
                  )}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowProtocolPicker(false)}
              className="mt-4 w-full py-2 rounded-xl bg-[#2a2a4a] text-gray-300 text-sm hover:bg-[#3a3a5a] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Water Goal Modal */}
      {showWaterGoal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setShowWaterGoal(false)}
        >
          <div
            className="bg-[#1a1a2e] rounded-2xl p-6 w-full max-w-sm mx-4 flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-white text-lg font-semibold">Daily Water Goal</h2>
            <div className="flex flex-col gap-1">
              <label className="text-gray-400 text-xs">Amount in ml</label>
              <input
                type="number"
                value={waterGoalInput}
                onChange={(e) => setWaterGoalInput(e.target.value)}
                className="bg-[#0f0f1a] border border-[#2a2a4a] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                placeholder="2500"
                min={100}
                max={10000}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowWaterGoal(false)}
                className="px-4 py-2 rounded-lg text-sm text-gray-300 bg-[#2a2a4a] hover:bg-[#3a3a5a] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={updateWaterGoal}
                className="px-4 py-2 rounded-lg text-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
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
    <p className="text-indigo-300 text-xs font-semibold uppercase tracking-widest mb-1 px-1">
      {label}
    </p>
  );
}

interface SettingsRowProps {
  label: string;
  value?: string;
  onPress: () => void;
  showChevron?: boolean;
  destructive?: boolean;
}

function SettingsRow({ label, value, onPress, showChevron, destructive }: SettingsRowProps) {
  return (
    <button
      type="button"
      onClick={onPress}
      className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#2a2a4a] transition-colors"
    >
      <span className={`text-sm font-medium ${destructive ? "text-red-400" : "text-white"}`}>
        {label}
      </span>
      <span className="flex items-center gap-1 text-gray-400 text-sm">
        {value && <span>{value}</span>}
        {showChevron && <span>›</span>}
      </span>
    </button>
  );
}
