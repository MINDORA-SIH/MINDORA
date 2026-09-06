import { Activity, Clock, Flame, Gauge } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import {
  dashboardDisclaimer,
  getActivitySummary,
  getAttentionState,
  getCaregiverInsights,
  getGamePerformance,
  getLastSession,
  getMonitoringStatus,
  getParameterHighlights,
  getPerformanceSnapshot,
  getRecentSessions,
  getStreak,
  patientProfile,
} from "@/data/dashboardSelectors"
import type { CognitiveParameterId } from "@/data/dashboardTypes"
import { ActivityCalendar } from "@/components/dashboard/ActivityCalendar"
import { ActivityLevelCard } from "@/components/dashboard/ActivityLevelCard"
import { AttentionRequired } from "@/components/dashboard/AttentionRequired"
import { CaregiverActions } from "@/components/dashboard/CaregiverActions"
import { CognitivePerformance } from "@/components/dashboard/CognitivePerformance"
import { KeyInsights } from "@/components/dashboard/KeyInsights"
import { PatientHeader } from "@/components/dashboard/PatientHeader"
import { PerformanceByActivity } from "@/components/dashboard/PerformanceByActivity"
import { PerformanceTrend } from "@/components/dashboard/PerformanceTrend"
import { RecentActivity } from "@/components/dashboard/RecentActivity"
import { SummaryMetricCard } from "@/components/dashboard/SummaryMetricCard"
import { ACTIVITY_TONE } from "@/components/dashboard/tokens"

/**
 * Caregiver monitoring view for a single patient. Every figure below comes from
 * the selectors in `dashboardSelectors`, so this file only arranges and labels —
 * it never derives a number itself.
 */
export function CaregiverDashboard() {
  const { t } = useTranslation()
  const [highlightedId, setHighlightedId] =
    useState<CognitiveParameterId | null>(null)

  const activity = getActivitySummary()
  const streak = getStreak()
  const performance = getPerformanceSnapshot()
  const status = getMonitoringStatus()
  const attention = getAttentionState()
  const lastSession = getLastSession()
  const { parameters, strongest, weakest, improving } = getParameterHighlights()
  const insights = getCaregiverInsights()
  const sessions = getRecentSessions()
  const { games, focusInsight } = getGamePerformance()

  const streakUnit =
    streak.current === 1
      ? t("dashboard.day", "day")
      : t("dashboard.days", "days")

  /** Sends the caregiver from the attention panel to the parameter it names. */
  const handleViewDetails = () => {
    setHighlightedId(attention.parameter?.id ?? null)
    // Instant rather than smooth: smooth scrolling is ignored under
    // prefers-reduced-motion and in some embedded webviews, and the jump has to
    // happen for the highlight below to make sense.
    document
      .getElementById("cognitive-performance")
      ?.scrollIntoView({ block: "start" })
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <PatientHeader
        patient={patientProfile}
        status={status}
        lastActiveLabel={lastSession.lastActiveLabel}
        activity={activity}
      />

      <section
        aria-label={t("dashboard.monitoringSummary", "Monitoring summary")}
      >
        <h2 className="sr-only">
          {t("dashboard.monitoringSummary", "Monitoring summary")}
        </h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <SummaryMetricCard
            label={t("dashboard.performanceIndex", "Performance Index")}
            value={`${performance.current}`}
            unit={t("dashboard.performanceUnit", "/ 100")}
            supporting={t(
              "dashboard.performanceSupporting",
              "Composite score across recent activities",
            )}
            icon={Gauge}
            tone="brand"
            trend={{
              changePercent: performance.changePercent,
              direction: performance.direction,
              suffix: t("dashboard.performanceSuffix", "vs last week"),
            }}
          />
          <SummaryMetricCard
            label={t("dashboard.activityLevel", "Activity Level")}
            value={activity.levelLabel}
            supporting={t(
              "dashboard.activitySupporting",
              "Active {{active}} of the last {{window}} days",
              { active: activity.activeDays, window: activity.windowDays },
            )}
            footnote={t(
              "dashboard.activityFootnote",
              "{{count}} activities this week",
              { count: activity.activitiesThisWeek },
            )}
            icon={Activity}
            tone={ACTIVITY_TONE[activity.level]}
          />
          <SummaryMetricCard
            label={t("dashboard.currentStreak", "Current Streak")}
            value={`${streak.current}`}
            unit={streakUnit}
            supporting={t(
              "dashboard.streakSupporting",
              "Consecutive days with activity",
            )}
            footnote={t(
              "dashboard.streakFootnote",
              "Longest recorded: {{count}} days",
              { count: streak.longest },
            )}
            icon={Flame}
            tone="info"
          />
          <SummaryMetricCard
            label={t("dashboard.lastSession", "Last Session")}
            value={lastSession.dayLabel}
            supporting={t(
              "dashboard.lastSessionSupporting",
              "{{time}} · {{game}}",
              { time: lastSession.timeLabel, game: lastSession.gameName },
            )}
            footnote={t(
              "dashboard.lastSessionFootnote",
              "{{count}} min recorded",
              { count: lastSession.minutes },
            )}
            icon={Clock}
            tone="neutral"
          />
        </div>
      </section>

      <AttentionRequired
        attention={attention}
        onViewDetails={handleViewDetails}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-5">
        <div className="order-2 lg:order-1">
          <ActivityCalendar />
        </div>
        <div className="order-1 lg:order-2">
          <ActivityLevelCard activity={activity} />
        </div>
      </div>

      <CognitivePerformance
        parameters={parameters}
        strongest={strongest}
        weakest={weakest}
        improving={improving}
        highlightedId={highlightedId}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] xl:gap-5">
        <PerformanceTrend />
        <KeyInsights insights={insights} />
      </div>

      <RecentActivity sessions={sessions} />

      <PerformanceByActivity games={games} focusInsight={focusInsight} />

      <CaregiverActions />

      <p
        className="px-1 pb-1 text-center text-[14px] font-semibold leading-snug"
        style={{ color: "var(--muted)" }}
      >
        {t("dashboard.disclaimer", dashboardDisclaimer)}
      </p>
    </div>
  )
}

export default CaregiverDashboard
