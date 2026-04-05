import { useEffect, useRef, useState, useCallback, Children } from "react";

interface SwipeNavProps {
  children: React.ReactNode;
  initialIndex?: number;
  onSettingsTap: () => void;
}

export function SwipeNav({ children, initialIndex = 1, onSettingsTap }: SwipeNavProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const childRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const childArray = Children.toArray(children);
  const count = childArray.length;

  // Scroll to initial index on mount (no animation)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const targetX = initialIndex * el.clientWidth;
    el.scrollTo?.({ left: targetX, behavior: "instant" as ScrollBehavior });
  }, [initialIndex]);

  // IntersectionObserver to track which screen is visible
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const idx = childRefs.current.indexOf(entry.target as HTMLDivElement);
            if (idx >= 0) setActiveIndex(idx);
          }
        }
      },
      { root: container, threshold: 0.5 }
    );

    for (const ref of childRefs.current) {
      if (ref) observer.observe(ref);
    }

    return () => observer.disconnect();
  }, [count]);

  const scrollToIndex = useCallback((index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo?.({ left: index * el.clientWidth, behavior: "smooth" });
  }, []);

  const labels = ["Water", "Timer", "Progress"];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top bar: dots + gear icon */}
      <div className="shrink-0 pt-[env(safe-area-inset-top,0px)] bg-[#0f0f1a] z-10">
        <div className="flex items-center justify-between px-4 py-2">
          {/* Screen label */}
          <span className="text-white/60 text-xs font-medium tracking-wide w-16">
            {labels[activeIndex] ?? ""}
          </span>

          {/* Dot indicators */}
          <div className="flex gap-2 items-center">
            {childArray.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollToIndex(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === activeIndex
                    ? "w-2 h-2 bg-indigo-400"
                    : "w-1.5 h-1.5 bg-white/20"
                }`}
                aria-label={`Go to ${labels[i]}`}
              />
            ))}
          </div>

          {/* Settings gear */}
          <button
            onClick={onSettingsTap}
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-300 transition-colors"
            aria-label="Settings"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Horizontal scroll-snap container */}
      <div
        ref={scrollRef}
        className="flex-1 flex overflow-x-auto overflow-y-hidden overscroll-x-none"
        style={{
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
        }}
      >
        {childArray.map((child, i) => (
          <div
            key={i}
            ref={(el) => { childRefs.current[i] = el; }}
            className="w-full h-full shrink-0 overflow-y-auto"
            style={{ scrollSnapAlign: "center" }}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}
