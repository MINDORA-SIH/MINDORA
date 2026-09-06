import { clsx } from "clsx"
import { Activity } from "lucide-react"
import { useTranslation } from "react-i18next"
import { WEEKDAY_INITIALS } from "@/data/dashboardData"
import {
  type ActivitySummary,
  formatShortDate,
} from "@/data/dashboardSelectors"
import type { CalendarDayStatus } from "@/data/dashboardTypes"
import { ACTIVITY_TONE, type SemanticTone, TONES } from "./tokens"
import { SectionCard, SegmentedMeter, StatTile } from "./ui"

const DAY_TONE: Record<CalendarDayStatus, SemanticTone> = {
  completed: "stable",
  partial: "monitor",
  none: "neutral",
  future: "neutral",
}

export function ActivityLevelCard({ activity }: { activity: ActivitySummary }) {
  const { t } = useTranslation()
  const tone = ACTIVITY_TONE[activity.level]
  const toneStyle = TONES[tone]
  const filledBlocks = Math.max(
    Math.round(activity.ratio * 10),
    activity.activeDays > 0 ? 1 : 0,
  )

  return (
    <SectionCard
      title={t("dashboard.activityLevelTitle", "Activity Level")}
      subtitle={t("dashboard.activityLevelSubtitle", "Participation over the last 7 days")}
      icon={Activity}
      tone={tone}
      className="h-full"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p
            className="text-[34px] font-extrabold leading-none"
            style={{ color: "var(--foreground)" }}
          >
            {activity.levelLabel}
          </p>
          <p
            className="mt-1 text-[15px] font-semibold"
            style={{ color: "var(--muted)" }}
          >
            {t("dashboard.activeDaysStatus", "{{active}} of {{window}} days active", {
              active: activity.activeDays,
              window: activity.windowDays,
              defaultValue: `${activity.activeDays} of ${activity.windowDays} days active`
            })}
          </p>
        </div>
        <p
          className={clsx(
            "rounded-full border px-3 py-1 text-[13px] font-extrabold",
            toneStyle.surface,
            toneStyle.border,
            toneStyle.text,
          )}
        >
          {t("dashboard.todayLevel", "Today: {{level}}", {
            level: activity.todayLevelLabel,
            defaultValue: `Today: ${activity.todayLevelLabel}`
          })}
        </p>
      </div>

      <div className="mt-3">
        <SegmentedMeter
          filled={filledBlocks}
          tone={tone}
          label={t("dashboard.activityLevelMeterLabel", "Activity level {{level}}, {{active}} of {{window}} days active", {
            level: activity.levelLabel,
            active: activity.activeDays,
            window: activity.windowDays,
            defaultValue: `Activity level ${activity.levelLabel}, ${activity.activeDays} of ${activity.windowDays} days active`
          })}
        />
      </div>

      <ul className="mt-4 grid grid-cols-7 gap-1.5">
        {activity.week.map((day) => {
          const dayToneStyle = TONES[DAY_TONE[day.status]]
          const detail = day.session
            ? t("dashboard.dayDetailSession", "{{activities}} activities · {{minutes}} min", {
                activities: day.session.gamesCompleted,
                minutes: day.session.sessionMinutes,
                defaultValue: `${day.session.gamesCompleted} activities · ${day.session.sessionMinutes} min`
              })
            : t("dashboard.dayDetailNoActivity", "No activity recorded")
          return (
            <li key={day.isoDate} className="flex flex-col items-center gap-1">
              <span
                className="text-[12px] font-extrabold"
                style={{ color: "var(--muted)" }}
              >
                {WEEKDAY_INITIALS[day.weekday]}
              </span>
              <span
                title={`${formatShortDate(day.isoDate)} · ${detail}`}
                className={clsx(
                  "grid h-9 w-full place-items-center rounded-xl border text-[14px] font-extrabold",
                  dayToneStyle.surface,
                  dayToneStyle.border,
                  dayToneStyle.text,
                  day.isToday &&
                    "ring-2 ring-[#5B9BD5] ring-offset-1 ring-offset-[var(--card-bg)]",
                )}
              >
                {day.day}
              </span>
            </li>
          )
        })}
      </ul>

      <dl className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        <StatTile
          label={t("dashboard.sessionsLabel", "Sessions")}
          value={`${activity.sessions}`}
          hint={t("dashboard.thisWeekHint", "this week")}
        />
        <StatTile
          label={t("dashboard.averageSessionLabel", "Average session")}
          value={`${activity.averageSessionMinutes} ${t("dashboard.min", "min")}`}
          hint={t("dashboard.perActiveDayHint", "per active day")}
        />
        <StatTile
          label={t("dashboard.activitiesLabel", "Activities")}
          value={`${activity.activitiesThisWeek}`}
          hint={t("dashboard.completedThisWeekHint", "completed this week")}
        />
        <StatTile
          label={t("dashboard.totalTimeLabel", "Total time")}
          value={`${activity.totalMinutes} ${t("dashboard.min", "min")}`}
          hint={t("dashboard.thisWeekHint", "this week")}
        />
        <StatTile
          label={t("dashboard.last30DaysLabel", "Last 30 days")}
          value={`${activity.activitiesLast30Days}`}
          hint={t("dashboard.activitiesCompletedHint", "activities completed")}
          tone="info"
        />
      </dl>

      <p
        className={clsx(
          "mt-3.5 rounded-2xl border px-4 py-3 text-[15px] font-bold leading-snug",
          toneStyle.surface,
          toneStyle.border,
        )}
        style={{ color: "var(--foreground)" }}
      >
        {activity.interpretation}
      </p>
    </SectionCard>
  )
}
