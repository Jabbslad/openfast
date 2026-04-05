import { useEffect, useRef, useState } from "react";

interface WaterTumblerProps {
  fillPercent: number; // 0-100
  size?: number;
}

export function WaterTumbler({ fillPercent, size = 180 }: WaterTumblerProps) {
  const clampedFill = Math.max(0, Math.min(100, fillPercent));

  // Tumbler dimensions (in viewBox coordinates)
  const viewW = 120;
  const viewH = 160;
  const topWidth = 90;
  const bottomWidth = 70;
  const bodyTop = 30;
  const bodyBottom = 145;
  const bodyHeight = bodyBottom - bodyTop;
  const cx = viewW / 2;
  const rimCurve = 4;

  // Animation state
  const [displayFill, setDisplayFill] = useState(0);
  const [waveAmplitude, setWaveAmplitude] = useState(0);
  const [wavePhase, setWavePhase] = useState(0);
  const animRef = useRef<number>(0);
  const prevFillRef = useRef(0);
  const svgRef = useRef<SVGSVGElement>(null);
  const isVisible = useRef(false);
  const hasEntrance = useRef(false);

  // Entrance animation: rise from 0 to current when scrolling into view
  useEffect(() => {
    const el = svgRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible.current) {
          isVisible.current = true;
          if (clampedFill > 0) {
            animateRise(0, clampedFill, 1500, 10);
          }
          hasEntrance.current = true;
        } else if (!entry.isIntersecting) {
          isVisible.current = false;
          hasEntrance.current = false;
          cancelAnimationFrame(animRef.current);
          setDisplayFill(0);
          setWaveAmplitude(0);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Splash animation: when fillPercent increases (water added)
  useEffect(() => {
    if (!isVisible.current || !hasEntrance.current) {
      prevFillRef.current = clampedFill;
      return;
    }

    const prev = prevFillRef.current;
    const diff = clampedFill - prev;
    prevFillRef.current = clampedFill;

    if (diff > 0) {
      // Water added — rise with splash
      animateRise(prev, clampedFill, 2000, 6);
    } else if (diff < 0) {
      // Water removed — drop with slosh
      animateRise(prev, clampedFill, 1500, 5);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clampedFill]);

  function animateRise(from: number, to: number, duration: number, splashIntensity = 8) {
    cancelAnimationFrame(animRef.current);
    const start = performance.now();
    // Total animation time includes the slosh settling after the rise
    const totalDuration = duration + 1500;

    function tick(now: number) {
      const elapsed = now - start;
      const riseT = Math.min(elapsed / duration, 1);

      // Ease-out cubic for the rise
      const eased = 1 - Math.pow(1 - riseT, 3);
      setDisplayFill(from + (to - from) * eased);

      // Damped sine wave for the slosh — starts when rise begins,
      // continues after rise completes to let the water settle
      const waveT = elapsed / 1000;
      const damping = Math.exp(-waveT * 1.8); // slower damping = longer visible slosh
      const wave = damping * splashIntensity * Math.sin(waveT * 12);
      setWaveAmplitude(wave);
      setWavePhase(waveT * 6);

      if (elapsed < totalDuration && (riseT < 1 || Math.abs(wave) > 0.05)) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        setWaveAmplitude(0);
      }
    }

    animRef.current = requestAnimationFrame(tick);
  }

  useEffect(() => {
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  // Computed water geometry
  const waterHeight = (displayFill / 100) * bodyHeight;
  const waterTop = bodyBottom - waterHeight;

  function getWidth(y: number): number {
    const t = (y - bodyTop) / bodyHeight;
    return topWidth + (bottomWidth - topWidth) * t;
  }

  const waterTopWidth = getWidth(waterTop);
  const waterBottomWidth = getWidth(bodyBottom);

  const glassPath = `
    M ${cx - topWidth / 2} ${bodyTop}
    Q ${cx} ${bodyTop - rimCurve} ${cx + topWidth / 2} ${bodyTop}
    L ${cx + bottomWidth / 2} ${bodyBottom}
    Q ${cx} ${bodyBottom + 8} ${cx - bottomWidth / 2} ${bodyBottom}
    Z
  `;

  // Water body path with animated wave as top edge
  const amp = waveAmplitude;
  const ph = wavePhase;
  const wW = waterTopWidth;

  const waterPath = displayFill > 0 ? `
    M ${cx - wW / 2} ${waterTop}
    C ${cx - wW / 3} ${waterTop + amp * Math.sin(ph)}
      ${cx - wW / 6} ${waterTop - amp * Math.sin(ph + 1.5)}
      ${cx} ${waterTop + amp * Math.sin(ph + 3) * 0.5}
    C ${cx + wW / 6} ${waterTop - amp * Math.sin(ph + 1.5)}
      ${cx + wW / 3} ${waterTop + amp * Math.sin(ph)}
      ${cx + wW / 2} ${waterTop}
    L ${cx + waterBottomWidth / 2} ${bodyBottom}
    Q ${cx} ${bodyBottom + 8} ${cx - waterBottomWidth / 2} ${bodyBottom}
    Z
  ` : "";

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size * (viewH / viewW)}
      viewBox={`0 0 ${viewW} ${viewH}`}
      fill="none"
      className="mx-auto"
    >
      <defs>
        <linearGradient id="water-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="glass-shine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="white" stopOpacity="0.08" />
          <stop offset="40%" stopColor="white" stopOpacity="0.02" />
          <stop offset="100%" stopColor="white" stopOpacity="0.06" />
        </linearGradient>
        <clipPath id="glass-clip">
          <path d={`
            M ${cx - topWidth / 2 + 2} ${bodyTop + 1}
            Q ${cx} ${bodyTop - rimCurve + 1} ${cx + topWidth / 2 - 2} ${bodyTop + 1}
            L ${cx + bottomWidth / 2 - 2} ${bodyBottom - 2}
            Q ${cx} ${bodyBottom + 6} ${cx - bottomWidth / 2 + 2} ${bodyBottom - 2}
            Z
          `} />
        </clipPath>
      </defs>

      {/* Glass body fill (translucent) */}
      <path d={glassPath} fill="url(#glass-shine)" stroke="none" />

      {/* Water fill (clipped inside glass) */}
      {displayFill > 0 && (
        <g clipPath="url(#glass-clip)">
          <path d={waterPath} fill="url(#water-fill)" />
          {/* Wave surface highlight */}
          <path
            d={`
              M ${cx - wW / 2} ${waterTop}
              C ${cx - wW / 3} ${waterTop + amp * Math.sin(ph)}
                ${cx - wW / 6} ${waterTop - amp * Math.sin(ph + 1.5)}
                ${cx} ${waterTop + amp * Math.sin(ph + 3) * 0.5}
              C ${cx + wW / 6} ${waterTop - amp * Math.sin(ph + 1.5)}
                ${cx + wW / 3} ${waterTop + amp * Math.sin(ph)}
                ${cx + wW / 2} ${waterTop}
            `}
            stroke="#38bdf8"
            strokeWidth="1.5"
            strokeOpacity={0.3 + Math.min(Math.abs(amp) * 0.05, 0.3)}
            fill="none"
          />
        </g>
      )}

      {/* Glass outline */}
      <path
        d={glassPath}
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Left side highlight (glass refraction) */}
      <line
        x1={cx - topWidth / 2 + 8}
        y1={bodyTop + 10}
        x2={cx - bottomWidth / 2 + 8}
        y2={bodyBottom - 10}
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
