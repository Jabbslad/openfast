import { useEffect, useRef, useState } from "react";
import { getAllZones, getZoneForElapsedMs, getElapsedHours } from "../utils/zones";

interface ZoneTimelineProps {
  elapsedMs: number;
  onZoneTap?: (zoneId: string) => void;
}

export function ZoneTimeline({ elapsedMs, onZoneTap }: ZoneTimelineProps) {
  const zones = getAllZones();
  const currentZone = getZoneForElapsedMs(elapsedMs);
  const elapsedHours = getElapsedHours(elapsedMs);

  // Animated entrance: sweep from 0 to current when visible
  const [animFactor, setAnimFactor] = useState(0); // 0 = empty, 1 = full target
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const isAnimating = useRef(false);
  const isVisible = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible.current) {
          isVisible.current = true;
          cancelAnimationFrame(animRef.current);
          isAnimating.current = true;
          const duration = 1500;
          const start = performance.now();

          function tick(now: number) {
            const t = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            setAnimFactor(eased);
            if (t < 1) {
              animRef.current = requestAnimationFrame(tick);
            } else {
              isAnimating.current = false;
              setAnimFactor(1);
            }
          }

          setAnimFactor(0);
          setTimeout(() => {
            animRef.current = requestAnimationFrame(tick);
          }, 50);
        } else if (!entry.isIntersecting) {
          isVisible.current = false;
          cancelAnimationFrame(animRef.current);
          isAnimating.current = false;
          setAnimFactor(0);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // When not animating, stay at full
  useEffect(() => {
    if (!isAnimating.current && isVisible.current) {
      setAnimFactor(1);
    }
  }, [elapsedMs]);

  useEffect(() => {
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  // Compute the animated elapsed hours — sweep from 0 to actual
  const animatedHours = elapsedHours * animFactor;

  return (
    <div ref={containerRef} className="w-full max-w-sm mt-4 px-2" role="group" aria-label="Fasting zones timeline">
      {/* Segment bar */}
      <div className="flex gap-[3px] h-2 rounded-full overflow-hidden">
        {zones.map((zone) => {
          const zoneEnd = zone.endHour ?? zone.startHour + 24;

          let fillPercent = 0;
          if (animatedHours >= zoneEnd) {
            fillPercent = 100;
          } else if (animatedHours > zone.startHour) {
            fillPercent = ((animatedHours - zone.startHour) / (zoneEnd - zone.startHour)) * 100;
          }

          return (
            <button
              key={zone.id}
              type="button"
              onClick={() => onZoneTap?.(zone.id)}
              className="flex-1 rounded-full overflow-hidden"
              style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
              aria-label={zone.name}
            >
              <div
                className="h-full rounded-full pointer-events-none"
                style={{
                  width: `${fillPercent}%`,
                  backgroundColor: zone.color,
                }}
              />
            </button>
          );
        })}
      </div>
      {/* Labels */}
      <div className="flex gap-[3px] mt-1.5">
        {zones.map((zone) => {
          const isCurrent = zone.id === currentZone.id;
          return (
            <button
              key={zone.id}
              type="button"
              onClick={() => onZoneTap?.(zone.id)}
              className="flex-1 text-center text-[11px] font-medium truncate transition-colors duration-300"
              style={{ color: isCurrent ? zone.color : "rgb(75, 85, 99)" }}
            >
              {zone.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
