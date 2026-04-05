import { useEffect, useState } from "react";
import { useSheetDrag } from "../hooks/useSheetDrag";
import { CHANGELOG } from "../content/changelog";

interface ChangelogSheetProps {
  open: boolean;
  onClose: () => void;
}

export function ChangelogSheet({ open, onClose }: ChangelogSheetProps) {
  const [visible, setVisible] = useState(false);
  const [sheetUp, setSheetUp] = useState(false);
  const { sheetRef, dragHandlers } = useSheetDrag({ onClose });

  useEffect(() => {
    if (open) {
      setVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setSheetUp(true));
      });
    } else {
      setSheetUp(false);
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 transition-colors duration-300 ${sheetUp ? "bg-black/70 backdrop-blur-sm" : "bg-transparent"}`}
      onClick={onClose}
    >
      <div
        ref={sheetRef}
        className={`absolute bottom-0 left-0 right-0 bg-[#12121f] rounded-t-3xl flex flex-col transition-transform duration-300 ease-out ${sheetUp ? "translate-y-0" : "translate-y-full"}`}
        style={{ height: "80%" }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Changelog"
        {...dragHandlers}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3">
          <h2 className="text-white text-lg font-semibold">What's New</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/[0.06] text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18" /><path d="M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable changelog */}
        <div className="flex-1 overflow-y-auto px-5 pb-8">
          {CHANGELOG.map((entry, i) => (
            <div key={entry.version} className={i > 0 ? "mt-6" : ""}>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-white text-base font-bold">{entry.version}</span>
                <span className="text-gray-500 text-xs">{entry.date}</span>
              </div>
              <ul className="space-y-2">
                {entry.changes.map((change, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-sm text-gray-400 leading-snug">
                    <span className="text-indigo-400 mt-1 shrink-0">
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
                        <circle cx="4" cy="4" r="3" />
                      </svg>
                    </span>
                    {change}
                  </li>
                ))}
              </ul>
              {i < CHANGELOG.length - 1 && (
                <div className="border-t border-white/[0.06] mt-6" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
