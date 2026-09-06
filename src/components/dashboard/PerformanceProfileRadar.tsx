import { useTranslation } from "react-i18next";
import type { ParameterInsight } from "@/data/dashboardSelectors";
import type { CognitiveParameterId } from "@/data/dashboardTypes";

/** Fixed axis order so the shape stays comparable between visits. */
const AXIS_ORDER: CognitiveParameterId[] = [
  "memory",
  "recognition",
  "attention",
  "processing-speed",
  "executive-function",
  "reasoning",
  "language",
];

const WIDTH = 340;
const HEIGHT = 300;
const CX = 170;
const CY = 152;
const RADIUS = 100;
const RINGS = [0.25, 0.5, 0.75, 1];

function pointAt(index: number, count: number, radius: number) {
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / count;
  return { x: CX + Math.cos(angle) * radius, y: CY + Math.sin(angle) * radius };
}

function polygon(scores: number[]) {
  return scores
    .map((score, index) => {
      const { x, y } = pointAt(index, scores.length, (Math.max(score, 0) / 100) * RADIUS);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

/**
 * Secondary view: the same seven scores as a shape, so a caregiver can see the
 * overall profile and how it compares with the previous week. The horizontal
 * bars above remain the primary read.
 */
export function PerformanceProfileRadar({ parameters }: { parameters: ParameterInsight[] }) {
  const { t } = useTranslation();
  const ordered = AXIS_ORDER.map((id) => parameters.find((parameter) => parameter.id === id)).filter(
    (parameter): parameter is ParameterInsight => Boolean(parameter),
  );
  const current = polygon(ordered.map((parameter) => parameter.score));
  const previous = polygon(ordered.map((parameter) => parameter.previousScore));

  return (
    <div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="mx-auto h-auto w-full max-w-[420px]"
        role="img"
        aria-label={t("dashboard.performanceProfileLabel", { labels: ordered.map((parameter) => `${parameter.name} ${parameter.score}`).join(", "), defaultValue: "Performance profile: {{labels}}" })}
      >
        {RINGS.map((ring) => (
          <polygon
            key={ring}
            points={polygon(ordered.map(() => ring * 100))}
            className="fill-none stroke-slate-200 dark:stroke-slate-700"
            strokeWidth={1}
          />
        ))}

        {ordered.map((parameter, index) => {
          const outer = pointAt(index, ordered.length, RADIUS);
          const label = pointAt(index, ordered.length, RADIUS + 22);
          const anchor = label.x > CX + 6 ? "start" : label.x < CX - 6 ? "end" : "middle";
          return (
            <g key={parameter.id}>
              <line
                x1={CX}
                y1={CY}
                x2={outer.x}
                y2={outer.y}
                className="stroke-slate-200 dark:stroke-slate-700"
                strokeWidth={1}
              />
              <text
                x={label.x}
                y={label.y}
                textAnchor={anchor}
                dominantBaseline="middle"
                fontSize={14}
                fontWeight={700}
                className="fill-[#4A5568] dark:fill-[#B6C2D4]"
              >
                {parameter.shortName}
              </text>
            </g>
          );
        })}

        <polygon points={previous} className="fill-none stroke-[#94A3B8]" strokeWidth={2} strokeDasharray="5 4" />
        <polygon points={current} className="fill-[#6C5CC4]/20 stroke-[#6C5CC4]" strokeWidth={2.5} />

        {ordered.map((parameter, index) => {
          const point = pointAt(index, ordered.length, (parameter.score / 100) * RADIUS);
          return <circle key={parameter.id} cx={point.x} cy={point.y} r={3.5} className="fill-[#6C5CC4]" />;
        })}
      </svg>

      <ul className="mt-1 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5">
        <li className="flex items-center gap-2 text-[13px] font-bold" style={{ color: "var(--muted)" }}>
          <span aria-hidden="true" className="h-1 w-6 rounded-full bg-[#6C5CC4]" />
          {t("dashboard.thisWeekLabel", { defaultValue: "This week" })}
        </li>
        <li className="flex items-center gap-2 text-[13px] font-bold" style={{ color: "var(--muted)" }}>
          <span aria-hidden="true" className="h-1 w-6 rounded-full bg-[#94A3B8]" />
          {t("dashboard.previousWeekLabel", { defaultValue: "Previous week" })}
        </li>
      </ul>
    </div>
  );
}
