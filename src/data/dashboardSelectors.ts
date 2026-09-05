import { allDays, dashboardData, MONTH_ABBR, MONTH_NAMES, TODAY_ISO, WEEKDAY_ABBR } from "./dashboardData";
import type {
  ActivityLevelId,
  AttentionSeverity,
  CalendarMonth,
  DayRecord,
  InsightTone,
  MonitoringStatusId,
  TrendDirection,
  TrendRangeId,
} from "./dashboardTypes";

/**
 * Derived caregiver values.
 *
 * Every number, label and sentence the dashboard shows is computed here from
 * `dashboardData` — components stay free of calculations, and the wording stays
 * factual: activity, change since the previous period, and areas to monitor.
 * Nothing here draws a clinical conclusion.
 */

/* ── Formatting ─────────────────────────────────────────────────────────── */

export function percentChange(current: number, previous: number): number {
  if (!previous) return 0;
  return Math.round(((current - previous) / previous) * 100);
}

export function directionOf(change: number): TrendDirection {
  return change > 0 ? "up" : change < 0 ? "down" : "flat";
}

function partsOf(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return { year, monthIndex: month - 1, day };
}

export function formatShortDate(iso: string): string {
  const { monthIndex, day } = partsOf(iso);
  return `${MONTH_ABBR[monthIndex]} ${day}`;
}

export function formatFullDate(iso: string): string {
  const { year, monthIndex, day } = partsOf(iso);
  return `${MONTH_NAMES[monthIndex]} ${day}, ${year}`;
}

export function weekdayLabel(iso: string): string {
  const { year, monthIndex, day } = partsOf(iso);
  return WEEKDAY_ABBR[new Date(Date.UTC(year, monthIndex, day)).getUTCDay()];
}

const YESTERDAY_ISO = new Date(new Date(`${TODAY_ISO}T00:00:00Z`).getTime() - 86_400_000)
  .toISOString()
  .slice(0, 10);

export function relativeDayLabel(iso: string): string {
  if (iso === TODAY_ISO) return "Today";
  if (iso === YESTERDAY_ISO) return "Yesterday";
  return formatShortDate(iso);
}

/** Days up to and including today — future dates never count as activity. */
const elapsedDays: DayRecord[] = allDays.filter((day) => day.isoDate <= TODAY_ISO);

/* ── Performance trend ──────────────────────────────────────────────────── */

const TREND_RANGES = {
  "7d": { label: "7 Days", days: 7, step: 1, useWeekdayLabels: true, comparison: "previous 7 days" },
  "30d": { label: "30 Days", days: 30, step: 3, useWeekdayLabels: false, comparison: "previous 30 days" },
  "3m": { label: "3 Months", days: 91, step: 7, useWeekdayLabels: false, comparison: "previous 3 months" },
} as const;

export const trendRangeOptions: { id: TrendRangeId; label: string }[] = [
  { id: "7d", label: TREND_RANGES["7d"].label },
  { id: "30d", label: TREND_RANGES["30d"].label },
  { id: "3m", label: TREND_RANGES["3m"].label },
];

export const defaultTrendRange: TrendRangeId = "30d";

export function getTrendSummary(rangeId: TrendRangeId) {
  const range = TREND_RANGES[rangeId];
  const history = dashboardData.indexHistory;
  const window = history.slice(-range.days);
  const previousWindow = history.slice(-range.days * 2, -range.days);

  const current = window[window.length - 1].score;
  const previousAverage = previousWindow.length
    ? previousWindow.reduce((total, point) => total + point.score, 0) / previousWindow.length
    : current;

  // Walk back from today so the most recent day is always plotted.
  const sampled: typeof window = [];
  for (let index = window.length - 1; index >= 0; index -= range.step) sampled.unshift(window[index]);

  const changePercent = percentChange(current, previousAverage);
  const scores = sampled.map((point) => point.score);

  return {
    rangeId,
    rangeLabel: range.label,
    comparisonLabel: range.comparison,
    points: sampled.map((point) => ({
      isoDate: point.isoDate,
      score: point.score,
      label: range.useWeekdayLabels ? weekdayLabel(point.isoDate) : formatShortDate(point.isoDate),
      fullLabel: `${weekdayLabel(point.isoDate)}, ${formatShortDate(point.isoDate)}`,
    })),
    current,
    previousAverage: Math.round(previousAverage),
    changePercent,
    direction: directionOf(changePercent),
    min: Math.min(...scores),
    max: Math.max(...scores),
  };
}

export type TrendSummary = ReturnType<typeof getTrendSummary>;
export type TrendPoint = TrendSummary["points"][number];

/** Headline Performance Index plus its week-on-week change. */
export function getPerformanceSnapshot() {
  const week = getTrendSummary("7d");
  return {
    current: week.current,
    previous: week.previousAverage,
    changePercent: week.changePercent,
    direction: week.direction,
  };
}

/* ── Cognitive parameters ───────────────────────────────────────────────── */

export function getCognitiveParameters() {
  return dashboardData.cognitiveParameters
    .map((parameter) => {
      const changePercent = percentChange(parameter.score, parameter.previousScore);
      return {
        ...parameter,
        changePercent,
        direction: directionOf(changePercent),
        relatedActivityWhen: relativeDayLabel(parameter.relatedActivityIso),
      };
    })
    .sort((a, b) => b.score - a.score || b.changePercent - a.changePercent);
}

export type ParameterInsight = ReturnType<typeof getCognitiveParameters>[number];

/** Strongest / weakest / most improved / most declined, derived from scores. */
export function getParameterHighlights() {
  const parameters = getCognitiveParameters();
  const byChange = [...parameters].sort((a, b) => b.changePercent - a.changePercent);
  const improving = byChange[0];
  const declining = byChange[byChange.length - 1];

  return {
    parameters,
    strongest: parameters[0],
    weakest: parameters[parameters.length - 1],
    improving: improving.changePercent > 0 ? improving : null,
    declining: declining.changePercent < 0 ? declining : null,
  };
}

/* ── Activity level ─────────────────────────────────────────────────────── */

const ACTIVITY_WINDOW = 7;

const ACTIVITY_LABELS: Record<ActivityLevelId, string> = {
  high: "High",
  moderate: "Moderate",
  low: "Low",
  none: "None",
};

const ACTIVITY_INTERPRETATION: Record<ActivityLevelId, string> = {
  high: "Patient has maintained regular activity this week.",
  moderate: "Activity has been somewhat inconsistent this week.",
  low: "Patient has had limited recent activity.",
  none: "No activity has been recorded in the last 7 days.",
};

export function getActivitySummary() {
  const window = elapsedDays.slice(-ACTIVITY_WINDOW);
  const activeDayRecords = window.filter((day) => day.session);
  const activeDays = activeDayRecords.length;
  const totalMinutes = activeDayRecords.reduce((total, day) => total + (day.session?.sessionMinutes ?? 0), 0);
  const ratio = activeDays / ACTIVITY_WINDOW;
  const level: ActivityLevelId = ratio >= 0.7 ? "high" : ratio >= 0.4 ? "moderate" : ratio > 0 ? "low" : "none";

  const today = elapsedDays[elapsedDays.length - 1];
  const todayGames = today.session?.gamesCompleted ?? 0;
  const todayMinutes = today.session?.sessionMinutes ?? 0;
  const todayLevel: ActivityLevelId =
    todayGames >= 2 || todayMinutes >= 10 ? "high" : todayGames === 1 ? "moderate" : "none";

  const last30 = elapsedDays.slice(-30);

  return {
    week: window,
    activeDays,
    windowDays: ACTIVITY_WINDOW,
    sessions: activeDays,
    totalMinutes,
    averageSessionMinutes: activeDays ? Math.round(totalMinutes / activeDays) : 0,
    activitiesThisWeek: window.reduce((total, day) => total + (day.session?.gamesCompleted ?? 0), 0),
    activitiesLast30Days: last30.reduce((total, day) => total + (day.session?.gamesCompleted ?? 0), 0),
    ratio,
    level,
    levelLabel: ACTIVITY_LABELS[level],
    interpretation: ACTIVITY_INTERPRETATION[level],
    todayLevel,
    todayLevelLabel: ACTIVITY_LABELS[todayLevel],
    todayGames,
    todayMinutes,
  };
}

export type ActivitySummary = ReturnType<typeof getActivitySummary>;

/** Consecutive active days ending today. */
export function getStreak() {
  let current = 0;
  for (let index = elapsedDays.length - 1; index >= 0; index--) {
    if (!elapsedDays[index].session) break;
    current++;
  }
  return { current, longest: dashboardData.streakRecord.longest };
}

/* ── Sessions ───────────────────────────────────────────────────────────── */

export function getRecentSessions() {
  return dashboardData.recentSessions.map((session) => ({
    ...session,
    dayLabel: relativeDayLabel(session.isoDate),
  }));
}

export type SessionEntry = ReturnType<typeof getRecentSessions>[number];

export function getLastSession() {
  const [latest] = getRecentSessions();
  return { ...latest, lastActiveLabel: `${latest.dayLabel}, ${latest.timeLabel}` };
}

/* ── Attention required ─────────────────────────────────────────────────── */

/** A change smaller than this is normal session-to-session variation. */
const WATCH_DECLINE = 5;
/** A drop this large matters when participation has also dropped. */
const SIGNIFICANT_DECLINE = 10;
/** A drop this large is flagged on its own. */
const SUSTAINED_DECLINE = 15;

export function getAttentionState() {
  const { declining } = getParameterHighlights();
  const activity = getActivitySummary();
  const reducedActivity = activity.level === "low" || activity.level === "none";

  if (!declining || Math.abs(declining.changePercent) < WATCH_DECLINE) {
    return {
      severity: "none" as AttentionSeverity,
      parameter: null,
      title: "No Immediate Concerns",
      message: "Cognitive performance and activity levels are stable compared with the previous week.",
      recommendation: "Continue with the current activity routine.",
    };
  }

  const drop = Math.abs(declining.changePercent);
  const severity: AttentionSeverity =
    drop >= SUSTAINED_DECLINE || (drop >= SIGNIFICANT_DECLINE && reducedActivity) ? "attention" : "monitor";

  return {
    severity,
    parameter: declining,
    title: "Attention Required",
    message: `${declining.name} declined ${drop}% this week.`,
    recommendation:
      severity === "attention"
        ? `Review recent ${declining.name.toLowerCase()} activities and note any change in daily routine.`
        : `Keep monitoring ${declining.name.toLowerCase()} over the next few sessions.`,
  };
}

export type AttentionState = ReturnType<typeof getAttentionState>;

/* ── Monitoring status ──────────────────────────────────────────────────── */

const STATUS_LABELS: Record<MonitoringStatusId, string> = {
  stable: "Stable",
  monitoring: "Needs Monitoring",
  attention: "Attention Required",
};

const STATUS_DESCRIPTIONS: Record<MonitoringStatusId, string> = {
  stable: "Activity and performance are in line with the previous period.",
  monitoring: "One or more areas have changed since the previous period.",
  attention: "A sustained change was recorded. Review recent sessions.",
};

/**
 * A monitoring indicator, not a diagnosis. One weaker result never escalates
 * on its own: it takes a sustained change, or a decline alongside reduced
 * participation.
 */
export function getMonitoringStatus() {
  const attention = getAttentionState();
  const activity = getActivitySummary();
  const week = getTrendSummary("7d");
  const reducedActivity = activity.level === "low" || activity.level === "none";

  let id: MonitoringStatusId = "stable";
  if (
    attention.severity === "attention" ||
    activity.level === "none" ||
    week.changePercent <= -10 ||
    (reducedActivity && week.changePercent < 0)
  ) {
    id = "attention";
  } else if (
    week.changePercent <= -5 ||
    reducedActivity ||
    (attention.severity === "monitor" && (week.changePercent < 0 || activity.level !== "high"))
  ) {
    id = "monitoring";
  }

  return { id, label: STATUS_LABELS[id], description: STATUS_DESCRIPTIONS[id] };
}

export type MonitoringStatus = ReturnType<typeof getMonitoringStatus>;

/* ── Caregiver insights ─────────────────────────────────────────────────── */

export interface CaregiverInsight {
  id: string;
  tone: InsightTone;
  title: string;
  detail: string;
}

/** Factual, neutral observations — no medical interpretation. */
export function getCaregiverInsights(): CaregiverInsight[] {
  const performance = getPerformanceSnapshot();
  const activity = getActivitySummary();
  const streak = getStreak();
  const { strongest, improving, declining } = getParameterHighlights();
  const insights: CaregiverInsight[] = [];

  insights.push({
    id: "trend",
    tone: performance.direction === "up" ? "positive" : performance.direction === "down" ? "watch" : "neutral",
    title:
      performance.direction === "up"
        ? "Overall performance is trending upward."
        : performance.direction === "down"
          ? "Overall performance is lower than last week."
          : "Overall performance is unchanged from last week.",
    detail: `Performance Index ${performance.current}, compared with an average of ${performance.previous} the previous week.`,
  });

  insights.push({
    id: "activity",
    tone: activity.level === "high" ? "positive" : activity.level === "moderate" ? "neutral" : "watch",
    title: activity.interpretation,
    detail: `${activity.activeDays} of the last ${activity.windowDays} days active · ${activity.averageSessionMinutes} min average session · ${streak.current}-day current streak.`,
  });

  insights.push({
    id: "strength",
    tone: "positive",
    title: `${strongest.name} is currently the strongest area.`,
    detail: `Score ${strongest.score} out of 100. Most recent related activity: ${strongest.relatedActivity}, ${strongest.relatedActivityWhen}.`,
  });

  if (declining) {
    insights.push({
      id: "monitor",
      tone: "watch",
      title: `${declining.name} is the area to monitor.`,
      detail: `Down ${Math.abs(declining.changePercent)}% from last week (${declining.previousScore} to ${declining.score}). Related activity: ${declining.relatedActivity}, ${declining.relatedActivityWhen}.`,
    });
  } else if (improving) {
    insights.push({
      id: "improving",
      tone: "positive",
      title: `${improving.name} has improved since last week.`,
      detail: `Up ${improving.changePercent}% (${improving.previousScore} to ${improving.score}).`,
    });
  }

  return insights;
}

/* ── Performance by activity ────────────────────────────────────────────── */

export function getGamePerformance() {
  const games = dashboardData.gameScores
    .map((game) => {
      const changePercent = percentChange(game.score, game.previousScore);
      return { ...game, changePercent, direction: directionOf(changePercent) };
    })
    .sort((a, b) => b.score - a.score);

  const focusTotals = new Map<string, { total: number; count: number }>();
  for (const game of games) {
    const entry = focusTotals.get(game.focus) ?? { total: 0, count: 0 };
    focusTotals.set(game.focus, { total: entry.total + game.score, count: entry.count + 1 });
  }

  let strongestFocus = games[0].focus;
  let bestAverage = 0;
  for (const [focus, { total, count }] of focusTotals) {
    const average = total / count;
    if (average > bestAverage) {
      bestAverage = average;
      strongestFocus = focus;
    }
  }

  return {
    games,
    strongestFocus,
    focusInsight: `${strongestFocus}-focused activities currently show the strongest performance.`,
  };
}

export type GamePerformance = ReturnType<typeof getGamePerformance>;
export type GamePerformanceEntry = GamePerformance["games"][number];

/* ── Participation calendar ─────────────────────────────────────────────── */

export function getCalendarMonths(): CalendarMonth[] {
  return dashboardData.calendarMonths;
}

/** Index of the month containing today, so the calendar opens on it. */
export function getCurrentMonthIndex(): number {
  const index = dashboardData.calendarMonths.findIndex((month) => month.days.some((day) => day.isToday));
  return index === -1 ? dashboardData.calendarMonths.length - 1 : index;
}

/** Most recent day with a recorded session in a month, for the detail panel. */
export function getMostRecentActiveDay(month: CalendarMonth): DayRecord {
  for (let index = month.days.length - 1; index >= 0; index--) {
    const day = month.days[index];
    if (day.session) return day;
  }
  return month.days[0];
}

export function findDay(isoDate: string): DayRecord | undefined {
  return allDays.find((day) => day.isoDate === isoDate);
}

export const dashboardDisclaimer = dashboardData.disclaimer;
export const patientProfile = dashboardData.patient;

