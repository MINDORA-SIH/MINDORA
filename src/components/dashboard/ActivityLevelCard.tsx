import { clsx } from "clsx";
import { Activity } from "lucide-react";
import { useTranslation } from "react-i18next";
import { WEEKDAY_INITIALS } from "@/data/dashboardData";
import { type ActivitySummary, formatShortDate } from "@/data/dashboardSelectors";
import type { CalendarDayStatus } from "@/data/dashboardTypes";
import { ACTIVITY_TONE, type SemanticTone, TONES } from "./tokens";
import { SectionCard, SegmentedMeter, StatTile } from "./ui";

const DAY_TONE: Record<CalendarDayStatus, SemanticTone> = {
  completed: "stable",
  partial: "monitor",
  none: "neutral",
  future: "neutral",
};

export function ActivityLevelCard({ activity }: { activity: ActivitySummary }) {
  const { t } = useTranslation();
  const tone = ACTIVITY_TONE[activity.level];
  const toneStyle = TONES[tone];
  const filledBlocks = Math.max(Math.round(activity.ratio * 10), activity.activeDays > 0 ? 1 : 0);

  return (
    <SectionCard
      title={t("dashboard.activityLevelTitle", { defaultValue: "Activity Level" })}
      subtitle={t("dashboard.activityLevelSubtitle", { defaultValue: "Participation over the last 7 days" })}
      icon={Activity}
      tone={tone}
      className="h-full"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[34px] font-extrabold leading-none" style={{ color: "var(--foreground)" }}>
            {activity.levelLabel}
          </p>
          <p className="mt-1 text-[15px] font-semibold" style={{ color: "var(--muted)" }}>
            {t("dashboard.daysActive", {
              active: activity.activeDays,
              window: activity.windowDays,
              defaultValue: "{{active}} of {{window}} days active",
            })}
          </p>
        </div>
        <p className={clsx("rounded-full border px-3 py-1 text-[13px] font-extrabold", toneStyle.surface, toneStyle.border, toneStyle.text)}>
          {t("dashboard.todayLevelPrefix", { defaultValue: "Today:" })} {activity.todayLevelLabel}
        </p>
      </div>

      <div className="mt-3">
        <SegmentedMeter
          filled={filledBlocks}
          tone={tone}
          label={t("dashboard.activityLevelMeter", {
            level: activity.levelLabel,
            active: activity.activeDays,
            window: activity.windowDays,
            defaultValue: "Activity level {{level}}, {{active}} of {{window}} days active",
          })}
        />
      </div>

      <ul className="mt-4 grid grid-cols-7 gap-1.5">
        {activity.week.map((day) => {
          const dayToneStyle = TONES[DAY_TONE[day.status]];
          const detail = day.session
            ? t("dashboard.activitiesAndMinutes", {
                count: day.session.gamesCompleted,
                minutes: day.session.sessionMinutes,
                defaultValue: "{{count}} activities · {{minutes}} min",
              })
            : t("dashboard.noActivityRecorded", { defaultValue: "No activity recorded" });
          return (
            <li key={day.isoDate} className="flex flex-col items-center gap-1">
              <span className="text-[12px] font-extrabold" style={{ color: "var(--muted)" }}>
                {WEEKDAY_INITIALS[day.weekday]}
              </span>
              <span
                title={`${formatShortDate(day.isoDate)} · ${detail}`}
                className={clsx(
                  "grid h-9 w-full place-items-center rounded-xl border text-[14px] font-extrabold",
                  dayToneStyle.surface,
                  dayToneStyle.border,
                  dayToneStyle.text,
                  day.isToday && "ring-2 ring-[#5B9BD5] ring-offset-1 ring-offset-[var(--card-bg)]",
                )}
              >
                {day.day}
              </span>
            </li>
          );
        })}
      </ul>

      <dl className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        <StatTile
          label={t("dashboard.statSessions", { defaultValue: "Sessions" })}
          value={`${activity.sessions}`}
          hint={t("dashboard.statSessionsHint", { defaultValue: "this week" })}
        />
        <StatTile
          label={t("dashboard.statAverageSession", { defaultValue: "Average session" })}
          value={`${activity.averageSessionMinutes} min`}
          hint={t("dashboard.statAverageSessionHint", { defaultValue: "per active day" })}
        />
        <StatTile
          label={t("dashboard.statActivitiesCompleted", { defaultValue: "Activities" })}
          value={`${activity.activitiesThisWeek}`}
          hint={t("dashboard.statActivitiesHint", { defaultValue: "completed this week" })}
        />
        <StatTile
          label={t("dashboard.statTotalTime", { defaultValue: "Total time" })}
          value={`${activity.totalMinutes} min`}
          hint={t("dashboard.statTotalTimeHint", { defaultValue: "this week" })}
        />
        <StatTile
          label={t("dashboard.statLast30Days", { defaultValue: "Last 30 days" })}
          value={`${activity.activitiesLast30Days}`}
          hint={t("dashboard.statLast30DaysHint", { defaultValue: "activities completed" })}
          tone="info"
        />
      </dl>

      <p
        className={clsx("mt-3.5 rounded-2xl border px-4 py-3 text-[15px] font-bold leading-snug", toneStyle.surface, toneStyle.border)}
        style={{ color: "var(--foreground)" }}
      >
        {activity.interpretation}
      </p>
    </SectionCard>
  );
}
