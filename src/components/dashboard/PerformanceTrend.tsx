import { clsx } from "clsx";
import { ChartLine } from "lucide-react";
import { useState } from "react";
import { defaultTrendRange, getTrendSummary, trendRangeOptions } from "@/data/dashboardSelectors";
import type { TrendRangeId } from "@/data/dashboardTypes";
import { TrendChart } from "./TrendChart";
import { SectionCard, StatTile, TrendBadge } from "./ui";

export function PerformanceTrend() {
  const [rangeId, setRangeId] = useState<TrendRangeId>(defaultTrendRange);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const summary = getTrendSummary(rangeId);
  const activeIndex = selectedIndex === null ? summary.points.length - 1 : Math.min(selectedIndex, summary.points.length - 1);
  const activePoint = summary.points[activeIndex];

  const rangeControl = (
    <div
      role="group"
      aria-label="Trend period"
      className="flex flex-wrap gap-1.5 rounded-2xl border-2 border-slate-200 p-1 dark:border-slate-700"
    >
      {trendRangeOptions.map((option) => {
        const isActive = option.id === rangeId;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={isActive}
            onClick={() => {
              setRangeId(option.id);
              setSelectedIndex(null);
            }}
            className={clsx(
              "min-h-11 rounded-xl px-3.5 py-1.5 text-[14px] font-extrabold transition-colors focus-visible:outline-3 focus-visible:outline-offset-2",
              isActive
                ? "bg-[#6C5CC4] text-white"
                : "hover:bg-slate-100 dark:hover:bg-slate-700",
            )}
            style={isActive ? undefined : { color: "var(--muted)" }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );

  return (
    <SectionCard
      title="Performance Trend"
      subtitle="Performance Index over the selected period"
      icon={ChartLine}
      tone="brand"
      action={rangeControl}
      className="h-full"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[15px] font-bold" style={{ color: "var(--muted)" }}>
          Dashed line: average for the {summary.comparisonLabel}
        </p>
        <p
          aria-live="polite"
          className="rounded-full border border-[#D6CBF5] bg-[#F5F2FF] px-3 py-1 text-[14px] font-extrabold dark:border-[#44386B] dark:bg-[#251F3D]"
          style={{ color: "var(--foreground)" }}
        >
          {activePoint.fullLabel} · Index {activePoint.score}
        </p>
      </div>

      <div className="mt-3">
        <TrendChart
          points={summary.points}
          previousAverage={summary.previousAverage}
          activeIndex={activeIndex}
          onSelect={setSelectedIndex}
        />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        <StatTile label="Current" value={`${summary.current} / 100`} hint="latest recorded index" tone="brand" />
        <StatTile
          label="Previous period"
          value={`${summary.previousAverage} / 100`}
          hint={`average, ${summary.comparisonLabel}`}
        />
        <div className="col-span-2 flex flex-col justify-center gap-1.5 rounded-2xl border border-[#DCE3EC] bg-[#F4F6FA] px-3.5 py-3 sm:col-span-1 dark:border-[#33405A] dark:bg-[#232F42]">
          <dt className="text-[12px] font-extrabold uppercase tracking-[0.1em]" style={{ color: "var(--muted-strong)" }}>
            Change
          </dt>
          <dd>
            <TrendBadge changePercent={summary.changePercent} direction={summary.direction} suffix="vs previous" />
          </dd>
        </div>
      </dl>

      <p className="mt-3 text-[13px] leading-snug" style={{ color: "var(--muted)" }}>
        The Performance Index is a 0-100 summary of scores across recent activities.
      </p>
    </SectionCard>
  );
}
