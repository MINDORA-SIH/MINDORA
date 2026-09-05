import { clsx } from "clsx";
import type { TrendPoint } from "@/data/dashboardSelectors";

const WIDTH = 600;
const HEIGHT = 200;
const PAD_X = 16;
const PAD_TOP = 16;
const PAD_BOTTOM = 14;

interface TrendChartProps {
  points: TrendPoint[];
  previousAverage: number;
  activeIndex: number;
  onSelect: (index: number) => void;
}

/**
 * Performance Index over time. The SVG holds geometry only — axis labels are
 * real HTML underneath so they keep their font size at every screen width.
 */
export function TrendChart({ points, previousAverage, activeIndex, onSelect }: TrendChartProps) {
  const scores = points.map((point) => point.score);
  const lower = Math.max(0, Math.floor((Math.min(...scores, previousAverage) - 3) / 5) * 5);
  const upper = Math.min(100, Math.ceil((Math.max(...scores, previousAverage) + 3) / 5) * 5);
  const domain = Math.max(upper - lower, 10);

  const plotWidth = WIDTH - PAD_X * 2;
  const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const xOf = (index: number) => PAD_X + (points.length === 1 ? plotWidth / 2 : (index / (points.length - 1)) * plotWidth);
  const yOf = (score: number) => PAD_TOP + (1 - (score - lower) / domain) * plotHeight;

  const line = points.map((point, index) => `${xOf(index).toFixed(1)},${yOf(point.score).toFixed(1)}`).join(" ");
  const area = `${PAD_X},${(PAD_TOP + plotHeight).toFixed(1)} ${line} ${(PAD_X + plotWidth).toFixed(1)},${(PAD_TOP + plotHeight).toFixed(1)}`;
  const labelEvery = points.length <= 7 ? 1 : points.length <= 10 ? 2 : 3;
  const lastIndex = points.length - 1;
  /**
   * The last point is always labelled, so drop any regular label that would sit
   * too close to it — otherwise the two collide on narrow screens.
   */
  const shouldLabel = (index: number) =>
    index === lastIndex || (index % labelEvery === 0 && lastIndex - index >= labelEvery);

  return (
    <div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-auto w-full" role="img" aria-label="Performance Index over the selected period">
        {[0, 0.5, 1].map((step) => (
          <line
            key={step}
            x1={PAD_X}
            x2={WIDTH - PAD_X}
            y1={PAD_TOP + step * plotHeight}
            y2={PAD_TOP + step * plotHeight}
            className="stroke-slate-200 dark:stroke-slate-700"
            strokeWidth={1}
          />
        ))}

        <line
          x1={PAD_X}
          x2={WIDTH - PAD_X}
          y1={yOf(previousAverage)}
          y2={yOf(previousAverage)}
          className="stroke-[#94A3B8]"
          strokeWidth={1.5}
          strokeDasharray="6 5"
        />

        <polygon points={area} className="fill-[#6C5CC4]/12" />
        <polyline
          points={line}
          className="fill-none stroke-[#6C5CC4]"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((point, index) => (
          <g
            key={point.isoDate}
            role="button"
            tabIndex={0}
            aria-label={`${point.fullLabel}: Performance Index ${point.score}`}
            onClick={() => onSelect(index)}
            onFocus={() => onSelect(index)}
            onMouseEnter={() => onSelect(index)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect(index);
              }
            }}
            className="cursor-pointer focus:outline-none"
          >
            <title>{`${point.fullLabel}: ${point.score}`}</title>
            <circle cx={xOf(index)} cy={yOf(point.score)} r={14} fill="transparent" />
            <circle
              cx={xOf(index)}
              cy={yOf(point.score)}
              r={index === activeIndex ? 6.5 : 4}
              className={clsx("stroke-[#6C5CC4]", index === activeIndex ? "fill-[#6C5CC4]" : "fill-white dark:fill-[#1E293B]")}
              strokeWidth={2.5}
            />
          </g>
        ))}
      </svg>

      <div className="relative mt-1 h-5">
        {points.map((point, index) => {
          const isLast = index === lastIndex;
          if (!shouldLabel(index)) return null;
          return (
            <span
              key={point.isoDate}
              className={clsx(
                "absolute top-0 text-[13px] font-bold whitespace-nowrap",
                index === activeIndex && "font-extrabold",
              )}
              style={{
                left: `${(xOf(index) / WIDTH) * 100}%`,
                transform: index === 0 ? "translateX(-25%)" : isLast ? "translateX(-75%)" : "translateX(-50%)",
                color: index === activeIndex ? "var(--foreground)" : "var(--muted)",
              }}
            >
              {point.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
