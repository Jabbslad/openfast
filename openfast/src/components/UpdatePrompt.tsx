import { useRegisterSW } from "virtual:pwa-register/react";

const UPDATE_CHECK_INTERVAL = 60 * 1000; // check every 60 seconds

export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;
      // Periodically check for SW updates — crucial for iOS standalone PWAs
      // which don't trigger update checks on their own
      setInterval(() => {
        registration.update();
      }, UPDATE_CHECK_INTERVAL);
    },
  });

  if (!needRefresh) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-xl bg-indigo-600 text-white text-sm font-medium shadow-lg">
      <span>Update available</span>
      <button
        onClick={() => updateServiceWorker(true)}
        className="px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 active:bg-white/40 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
      >
        Refresh
      </button>
    </div>
  );
}
