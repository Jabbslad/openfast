import { useState, useEffect } from "react";

export function LandscapeOverlay() {
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    function check() {
      // Only show on mobile-sized devices (tablets are fine in landscape)
      const isMobile = window.innerHeight < 600 || window.innerWidth < 600;
      const landscape = window.innerWidth > window.innerHeight;
      setIsLandscape(isMobile && landscape);
    }

    check();
    window.addEventListener("resize", check);
    window.addEventListener("orientationchange", check);
    return () => {
      window.removeEventListener("resize", check);
      window.removeEventListener("orientationchange", check);
    };
  }, []);

  if (!isLandscape) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#0f0f1a] flex flex-col items-center justify-center gap-4 px-8">
      <svg
        className="w-12 h-12 text-indigo-400 animate-pulse"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <path d="M12 18h.01" />
      </svg>
      <p className="text-white text-base font-medium text-center">
        Please rotate your device to portrait
      </p>
      <p className="text-gray-500 text-sm text-center">
        OpenFast is designed for portrait orientation
      </p>
    </div>
  );
}
