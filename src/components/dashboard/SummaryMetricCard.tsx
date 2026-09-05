import { clsx } from "clsx";
import type { TrendDirection } from "@/data/dashboardTypes";
import { type IconComponent, type SemanticTone, TONES } from "./tokens";
import { CARD_CLASS, CARD_STYLE, TrendBadge } from "./ui";

interface SummaryMetricCardProps {
  label: string;
  value: string;
  unit?: string;
  supporting: string;
  footnote?: string;
  icon: IconComponent;
  tone: SemanticTone;
  trend?: { changePercent: number; direction: TrendDirection; suffix?: string };
}

/** One of the four at-a-glance monitoring metrics. */
export function SummaryMetricCard({
  label,
  value,
  unit,
  supporting,
  footnote,
  icon: Icon,
  tone,
  trend,
}: SummaryMetricCardProps) {
  const toneStyle = TONES[tone];

  return (
    <div
      className={clsx(CARD_CLASS, "flex min-h-[152px] flex-col justify-between gap-2.5 p-4 sm:p-5")}
      style={CARD_STYLE}
    >
      <div className="flex items-start justify-between gap-2">
        <p
          className="text-[13px] font-extrabold uppercase leading-tight tracking-[0.1em]"
          style={{ color: "var(--muted)" }}
        >
          {label}
        </p>
        <span
          aria-hidden="true"
          className={clsx(
            "grid h-9 w-9 shrink-0 place-items-center rounded-xl border",
            toneStyle.surface,
            toneStyle.border,
          )}
        >
          <Icon className={clsx("h-4 w-4", toneStyle.text)} />
        </span>
      </div>

      <div>
        <p className="flex items-baseline gap-1">
          <span
            className="text-[30px] font-extrabold leading-none sm:text-[34px]"
            style={{ color: "var(--foreground)" }}
          >
            {value}
          </span>
          {unit ? (
            <span className="text-[15px] font-bold" style={{ color: "var(--muted)" }}>
              {unit}
            </span>
          ) : null}
        </p>
        {trend ? (
          <div className="mt-2">
            <TrendBadge {...trend} />
          </div>
        ) : null}
      </div>

      <div>
        <p className="text-[14px] font-bold leading-snug" style={{ color: "var(--foreground)" }}>
          {supporting}
        </p>
        {footnote ? (
          <p className="text-[13px] leading-snug" style={{ color: "var(--muted)" }}>
            {footnote}
          </p>
        ) : null}
      </div>
    </div>
  );
}
