import { formatDuration } from "../utils/time";

interface ProgressRingProps {
  elapsedMs: number;
  targetMs: number;
  size?: number;
}

export function ProgressRing({ elapsedMs, targetMs, size = 200 }: ProgressRingProps) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = targetMs > 0 ? Math.min(elapsedMs / targetMs, 1) : 0;
  const offset = circumference * (1 - progress);
  const goalReached = elapsedMs >= targetMs && targetMs > 0;
  const strokeColor = goalReached ? "#4ade80" : "#818cf8";
  const center = size / 2;

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(progress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Fasting progress"
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size}>
        <circle cx={center} cy={center} r={radius} fill="none" stroke="#2a2a4a" strokeWidth={strokeWidth} />
        <circle cx={center} cy={center} r={radius} fill="none" stroke={strokeColor} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`} className="transition-all duration-1000" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {goalReached && <span className="text-green-400 text-sm font-semibold mb-1">Goal Reached!</span>}
        <span className="text-3xl font-bold tracking-wide">{formatDuration(elapsedMs)}</span>
        <span className="text-sm text-gray-500 mt-1">of {formatDuration(targetMs)}</span>
      </div>
    </div>
  );
}
