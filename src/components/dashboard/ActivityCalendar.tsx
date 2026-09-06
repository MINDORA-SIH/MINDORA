import { clsx } from "clsx";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { WEEKDAY_INITIALS } from "@/data/dashboardData";
import {
  formatFullDate,
  getCalendarMonths,
  getCurrentMonthIndex,
  getMostRecentActiveDay,
  weekdayLabel,
} from "@/data/dashboardSelectors";
import type { CalendarDayStatus, DayRecord } from "@/data/dashboardTypes";
import { type SemanticTone } from "./tokens";
import { SectionCard, StatTile } from "./ui";

const CELL_CLASSES: Record<CalendarDayStatus, string> = {
  completed:
    "border-[#B6E3C8] bg-[#DFF4E8] text-[#166B45] hover:bg-[#CBEBDA] dark:border-[#27543E] dark:bg-[#183D2E] dark:text-[#9CE6BE]",
  partial:
    "border-[#F0D79E] bg-[#FDF2DC] text-[#8A5B0B] hover:bg-[#F8E7C4] dark:border-[#5E4718] dark:bg-[#3D2E12] dark:text-[#F3CE8C]",
  none: "border-[#DCE3EC] bg-[#F4F6FA] text-[#5A6579] hover:bg-[#E8EDF4] dark:border-[#33405A] dark:bg-[#222D40] dark:text-[#9FADC2]",
  /* Recessed but still legible: dates that have not happened yet keep the dashed
   * border as their signal rather than fading the number below 4.5:1. */
  future: "border-dashed border-[#E4E9F1] text-[#6B7788] dark:border-[#2C3A52] dark:text-[#8B98AC]",
};

const DETAIL_TONE: Record<CalendarDayStatus, SemanticTone> = {
  completed: "stable",
  partial: "monitor",
  none: "neutral",
  future: "neutral",
};

const LEGEND: { key: string; defaultValue: string; className: string }[] = [
  { key: "dashboard.legendCompleted", defaultValue: "Completed", className: "bg-[#DFF4E8] border-[#B6E3C8] dark:bg-[#183D2E] dark:border-[#27543E]" },
  { key: "dashboard.legendPartial", defaultValue: "Partial", className: "bg-[#FDF2DC] border-[#F0D79E] dark:bg-[#3D2E12] dark:border-[#5E4718]" },
  { key: "dashboard.legendNoActivity", defaultValue: "No activity", className: "bg-[#F4F6FA] border-[#DCE3EC] dark:bg-[#222D40] dark:border-[#33405A]" },
  { key: "dashboard.legendUpcoming", defaultValue: "Upcoming", className: "border-dashed border-[#E4E9F1] dark:border-[#2C3A52]" },
];

export function ActivityCalendar() {
  const { t } = useTranslation();
  const months = getCalendarMonths();
  const [monthCursor, setMonthCursor] = useState(getCurrentMonthIndex);
  const [selectedIso, setSelectedIso] = useState<string | null>(null);

  const statusText = (status: CalendarDayStatus) => {
    switch (status) {
      case "completed":
        return t("dashboard.statusCompleted", { defaultValue: "Full session completed" });
      case "partial":
        return t("dashboard.statusPartial", { defaultValue: "Short activity only" });
      case "none":
        return t("dashboard.statusNone", { defaultValue: "No activity recorded" });
      case "future":
        return t("dashboard.statusFuture", { defaultValue: "Upcoming date" });
    }
  };

  const month = months[monthCursor];
  const selectedDay: DayRecord =
    month.days.find((day) => day.isoDate === selectedIso) ??
    month.days.find((day) => day.isToday) ??
    getMostRecentActiveDay(month);

  const monthNav = (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => setMonthCursor((current) => Math.max(current - 1, 0))}
        disabled={monthCursor === 0}
        aria-label={t("dashboard.previousMonth", { defaultValue: "Previous month" })}
        className="h-11 w-11 rounded-xl border-2 border-slate-200 transition-colors hover:bg-slate-50 focus-visible:outline-3 focus-visible:outline-offset-2 disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-700"
      >
        <ChevronLeft className="h-5 w-5" style={{ color: "var(--foreground)" }} />
      </button>
      <span className="min-w-[8.5rem] text-center text-[15px] font-extrabold" style={{ color: "var(--foreground)" }}>
        {month.label}
      </span>
      <button
        type="button"
        onClick={() => setMonthCursor((current) => Math.min(current + 1, months.length - 1))}
        disabled={monthCursor === months.length - 1}
        aria-label={t("dashboard.nextMonth", { defaultValue: "Next month" })}
        className="h-11 w-11 rounded-xl border-2 border-slate-200 transition-colors hover:bg-slate-50 focus-visible:outline-3 focus-visible:outline-offset-2 disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-700"
      >
        <ChevronRight className="h-5 w-5" style={{ color: "var(--foreground)" }} />
      </button>
    </div>
  );

  return (
    <SectionCard
      title={t("dashboard.activityCalendarTitle", { defaultValue: "Activity Calendar" })}
      subtitle={t("dashboard.activityCalendarSubtitle", { defaultValue: "Patient participation by day" })}
      icon={CalendarDays}
      tone="info"
      action={monthNav}
      className="h-full"
    >
      <ul className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {LEGEND.map((item) => (
          <li key={item.key} className="flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: "var(--muted)" }}>
            <span aria-hidden="true" className={clsx("h-3.5 w-3.5 rounded-md border", item.className)} />
            {t(item.key, { defaultValue: item.defaultValue })}
          </li>
        ))}
        <li className="flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: "var(--muted)" }}>
          <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-[#3B82C4]" />
          {t("dashboard.today", { defaultValue: "Today" })}
        </li>
      </ul>

      <div className="mt-4 grid grid-cols-7 gap-1 sm:gap-2" aria-hidden="true">
        {WEEKDAY_INITIALS.map((initial, index) => (
          <span
            key={`${initial}-${index}`}
            className="text-center text-[13px] font-extrabold"
            style={{ color: "var(--muted)" }}
          >
            {initial}
          </span>
        ))}
      </div>

      <div className="mt-1.5 grid grid-cols-7 gap-1 sm:gap-2">
        {Array.from({ length: month.firstWeekday }, (_, index) => (
          <span key={`spacer-${index}`} aria-hidden="true" />
        ))}
        {month.days.map((day) => {
          const isSelected = day.isoDate === selectedDay.isoDate;
          const shared = clsx(
            "relative aspect-square min-h-11 w-full flex-col rounded-xl border-2 text-[16px] font-extrabold sm:min-h-12",
            CELL_CLASSES[day.status],
          );

          if (day.status === "future") {
            return (
              <span key={day.isoDate} className={clsx(shared, "flex items-center justify-center")}>
                {day.day}
              </span>
            );
          }

          return (
            <button
              key={day.isoDate}
              type="button"
              onClick={() => setSelectedIso(day.isoDate)}
              aria-pressed={isSelected}
              aria-label={`${formatFullDate(day.isoDate)} — ${statusText(day.status)}`}
              className={clsx(
                shared,
                "transition-transform focus-visible:outline-3 focus-visible:outline-offset-2 active:scale-95",
                isSelected && "ring-2 ring-[#6C5CC4] ring-offset-2 ring-offset-[var(--card-bg)]",
              )}
            >
              {day.day}
              {day.isToday ? (
                <span aria-hidden="true" className="mt-0.5 h-1.5 w-1.5 rounded-full bg-[#3B82C4]" />
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="mt-4 rounded-2xl border-2 border-slate-200 p-4 dark:border-slate-700" aria-live="polite">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-[17px] font-extrabold" style={{ color: "var(--foreground)" }}>
            {formatFullDate(selectedDay.isoDate)}
            {selectedDay.isToday ? " · " + t("dashboard.today", { defaultValue: "Today" }) : ""}
          </h3>
          <p className="text-[14px] font-bold" style={{ color: "var(--muted)" }}>
            {weekdayLabel(selectedDay.isoDate)} · {statusText(selectedDay.status)}
          </p>
        </div>

        {selectedDay.session ? (
          <dl className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            <StatTile
              label={t("dashboard.statActivities", { defaultValue: "Activities" })}
              value={`${selectedDay.session.gamesCompleted}`}
              tone={DETAIL_TONE[selectedDay.status]}
            />
            <StatTile label={t("dashboard.statSessionLength", { defaultValue: "Session length" })} value={`${selectedDay.session.sessionMinutes} min`} />
            <StatTile label={t("dashboard.statPerformanceIndex", { defaultValue: "Performance Index" })} value={`${selectedDay.session.performanceIndex} / 100`} tone="info" />
            <StatTile label={t("dashboard.statStrongestArea", { defaultValue: "Strongest area" })} value={selectedDay.session.strongestArea} tone="stable" />
            <StatTile label={t("dashboard.statAreaToMonitor", { defaultValue: "Area to monitor" })} value={selectedDay.session.areaToMonitor} tone="monitor" />
          </dl>
        ) : (
          <p className="mt-2 text-[15px] font-semibold leading-snug" style={{ color: "var(--muted)" }}>
            {t("dashboard.noActivityOnDate", { defaultValue: "No activity was recorded on this date. Occasional rest days are expected." })}
          </p>
        )}
      </div>
    </SectionCard>
  );
}
