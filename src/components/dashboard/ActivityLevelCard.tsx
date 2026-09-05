import { clsx } from "clsx";
import { Activity } from "lucide-react";
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
  const tone = ACTIVITY_TONE[activity.level];
  const toneStyle = TONES[tone];
  const filledBlocks = Math.max(Math.round(activity.ratio * 10), activity.activeDays > 0 ? 1 : 0);

  return (
    <SectionCard
      title="Activity Level"
      subtitle="Participation over the last 7 days"
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
            {activity.activeDays} of {activity.windowDays} days active
          </p>
        </div>
        <p className={clsx("rounded-full border px-3 py-1 text-[13px] font-extrabold", toneStyle.surface, toneStyle.border, toneStyle.text)}>
          Today: {activity.todayLevelLabel}
        </p>
      </div>

      <div className="mt-3">
        <SegmentedMeter
          filled={filledBlocks}
          tone={tone}
          label={`Activity level ${activity.levelLabel}, ${activity.activeDays} of ${activity.windowDays} days active`}
        />
      </div>

      <ul className="mt-4 grid grid-cols-7 gap-1.5">
        {activity.week.map((day) => {
          const dayToneStyle = TONES[DAY_TONE[day.status]];
          const detail = day.session
            ? `${day.session.gamesCompleted} activities · ${day.session.sessionMinutes} min`
            : "No activity recorded";
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
        <StatTile label="Sessions" value={`${activity.sessions}`} hint="this week" />
        <StatTile label="Average session" value={`${activity.averageSessionMinutes} min`} hint="per active day" />
        <StatTile label="Activities" value={`${activity.activitiesThisWeek}`} hint="completed this week" />
        <StatTile label="Total time" value={`${activity.totalMinutes} min`} hint="this week" />
        <StatTile
          label="Last 30 days"
          value={`${activity.activitiesLast30Days}`}
          hint="activities completed"
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
