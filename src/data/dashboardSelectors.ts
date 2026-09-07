import i18n from "@/i18n";
import { allDays, dashboardData, TODAY_ISO } from "./dashboardData";
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

/**
 * Translate at call time (not at module load) so a language switch is picked
 * up on the next render — components re-run these selectors while rendering.
 */
function dt(key: string, options?: Record<string, unknown>): string {
  return i18n.t(key, options ?? {}) as string;
}

function localeTag(): string {
  return i18n.language || "en";
}

function utcDateOf(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`);
}

export function formatShortDate(iso: string): string {
  return new Intl.DateTimeFormat(localeTag(), { day: "numeric", month: "short", timeZone: "UTC" }).format(utcDateOf(iso));
}

export function formatFullDate(iso: string): string {
  return new Intl.DateTimeFormat(localeTag(), { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(utcDateOf(iso));
}

export function weekdayLabel(iso: string): string {
  return new Intl.DateTimeFormat(localeTag(), { weekday: "short", timeZone: "UTC" }).format(utcDateOf(iso));
}

/** Localized single-letter weekday headers, Sunday first. */
export function weekdayInitials(): string[] {
  const formatter = new Intl.DateTimeFormat(localeTag(), { weekday: "narrow", timeZone: "UTC" });
  // 2023-01-01 is a Sunday; the next six dates cover the whole week.
  return Array.from({ length: 7 }, (_, index) => formatter.format(new Date(Date.UTC(2023, 0, 1 + index))));
}

/** Localized "September 2026"-style month label. */
export function monthLabel(year: number, monthIndex: number): string {
  return new Intl.DateTimeFormat(localeTag(), { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(year, monthIndex, 1)));
}

export function percentChange(current: number, previous: number): number {
  if (!previous) return 0;
  return Math.round(((current - previous) / previous) * 100);
}

export function directionOf(change: number): TrendDirection {
  return change > 0 ? "up" : change < 0 ? "down" : "flat";
}

const YESTERDAY_ISO = new Date(new Date(`${TODAY_ISO}T00:00:00Z`).getTime() - 86_400_000)
  .toISOString()
  .slice(0, 10);

export function relativeDayLabel(iso: string): string {
  if (iso === TODAY_ISO) return dt("dashboard.today", { defaultValue: "Today" });
  if (iso === YESTERDAY_ISO) return dt("dashboard.yesterday", { defaultValue: "Yesterday" });
  return formatShortDate(iso);
}

/** Days up to and including today — future dates never count as activity. */
const elapsedDays: DayRecord[] = allDays.filter((day) => day.isoDate <= TODAY_ISO);

/* ── Performance trend ──────────────────────────────────────────────────── */

const TREND_RANGES = {
  "7d": { days: 7, step: 1, useWeekdayLabels: true, labelKey: "dashboard.range7d", comparisonKey: "dashboard.prev7d" },
  "30d": { days: 30, step: 3, useWeekdayLabels: false, labelKey: "dashboard.range30d", comparisonKey: "dashboard.prev30d" },
  "3m": { days: 91, step: 7, useWeekdayLabels: false, labelKey: "dashboard.range3m", comparisonKey: "dashboard.prev3m" },
} as const;

export const trendRangeOptions: { id: TrendRangeId; labelKey: string }[] = [
  { id: "7d", labelKey: TREND_RANGES["7d"].labelKey },
  { id: "30d", labelKey: TREND_RANGES["30d"].labelKey },
  { id: "3m", labelKey: TREND_RANGES["3m"].labelKey },
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
    rangeLabel: dt(range.labelKey, { defaultValue: rangeId }),
    comparisonLabel: dt(range.comparisonKey, { defaultValue: rangeId }),
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

/* Localized display names. The data layer stores stable ids; wording lives in
 * the locale bundles so every consumer (list, radar, tiles) stays in sync. */
const AREA_NAME_KEYS: Record<string, { name: string; short?: string }> = {
  memory: { name: "dashboard.areaMemory" },
  recognition: { name: "dashboard.areaRecognition" },
  reasoning: { name: "dashboard.areaReasoning" },
  language: { name: "dashboard.areaLanguage" },
  "executive-function": { name: "dashboard.areaExecutive", short: "dashboard.areaExecutiveShort" },
  attention: { name: "dashboard.areaAttention" },
  "processing-speed": { name: "dashboard.areaSpeed", short: "dashboard.areaSpeedShort" },
};

export function areaName(id: string): string {
  return dt(AREA_NAME_KEYS[id]?.name ?? "dashboard.areaMemory", { defaultValue: id });
}

export function areaShortName(id: string): string {
  const shortKey = AREA_NAME_KEYS[id]?.short;
  return shortKey ? dt(shortKey, { defaultValue: id }) : areaName(id);
}

/** Session records store English area display names; map them back to keys. */
const SESSION_AREA_KEYS: Record<string, string> = {
  Memory: "dashboard.areaMemory",
  Recognition: "dashboard.areaRecognition",
  Attention: "dashboard.areaAttention",
  "Processing Speed": "dashboard.areaSpeed",
};

export function sessionAreaLabel(name: string): string {
  const key = SESSION_AREA_KEYS[name];
  return key ? dt(key, { defaultValue: name }) : name;
}

/* Game titles live under the shared `games.*` keys used by the home grid. */
const GAME_TITLE_KEYS: Record<string, string> = {
  "who-is-this": "games.whoIsThis.title",
  "word-sound-memory": "games.wordSoundMemory.title",
  "story-quiz": "games.storyQuiz.title",
  "daily-routine": "dailyRoutine.title",
  "pattern-recognition": "games.patternRecognition.title",
  "spot-the-difference": "games.spotTheDifference.title",
  "color-sequence": "games.colorSequence.title",
};

const GAME_TITLE_KEYS_BY_NAME: Record<string, string> = {
  "Who Is This?": "games.whoIsThis.title",
  "Word-Sound Memory": "games.wordSoundMemory.title",
  "Story Quiz": "games.storyQuiz.title",
  "Daily Routine": "dailyRoutine.title",
  "Pattern Recognition": "games.patternRecognition.title",
  "Spot the Difference": "games.spotTheDifference.title",
  "Color Sequence": "games.colorSequence.title",
};

export function gameTitle(idOrName: string): string {
  const key = GAME_TITLE_KEYS[idOrName] ?? GAME_TITLE_KEYS_BY_NAME[idOrName];
  return key ? dt(key, { defaultValue: idOrName }) : idOrName;
}

/* Focus labels per game score entry. */
const FOCUS_KEYS: Record<string, string> = {
  Memory: "dashboard.focusMemory",
  Listening: "dashboard.focusListening",
  Recall: "dashboard.focusRecall",
  Sequencing: "dashboard.focusSequencing",
  Reasoning: "dashboard.focusReasoning",
  Focus: "dashboard.focusFocus",
};

export function focusLabel(focus: string): string {
  const key = FOCUS_KEYS[focus];
  return key ? dt(key, { defaultValue: focus }) : focus;
}

export function getCognitiveParameters() {
  return dashboardData.cognitiveParameters
    .map((parameter) => {
      const changePercent = percentChange(parameter.score, parameter.previousScore);
      return {
        ...parameter,
        name: areaName(parameter.id),
        shortName: areaShortName(parameter.id),
        relatedActivity: gameTitle(parameter.relatedActivity),
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

function activityLevelLabel(level: ActivityLevelId): string {
  return dt(`dashboard.level${level.charAt(0).toUpperCase()}${level.slice(1)}`, { defaultValue: level });
}

function activityInterpretation(level: ActivityLevelId): string {
  return dt(`dashboard.interp${level.charAt(0).toUpperCase()}${level.slice(1)}`, { defaultValue: level });
}

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
    levelLabel: activityLevelLabel(level),
    interpretation: activityInterpretation(level),
    todayLevel,
    todayLevelLabel: activityLevelLabel(todayLevel),
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
    gameName: gameTitle(session.gameName),
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
      title: dt("dashboard.attentionOkTitle", { defaultValue: "No Immediate Concerns" }),
      message: dt("dashboard.attentionOkMessage", { defaultValue: "Cognitive performance and activity levels are stable compared with the previous week." }),
      recommendation: dt("dashboard.attentionOkRecommendation", { defaultValue: "Continue with the current activity routine." }),
    };
  }

  const drop = Math.abs(declining.changePercent);
  const severity: AttentionSeverity =
    drop >= SUSTAINED_DECLINE || (drop >= SIGNIFICANT_DECLINE && reducedActivity) ? "attention" : "monitor";

  return {
    severity,
    parameter: declining,
    title: dt("dashboard.attentionTitle", { defaultValue: "Attention Required" }),
    message: dt("dashboard.attentionMessage", { name: declining.name, drop, defaultValue: "{{name}} declined {{drop}}% this week." }),
    recommendation:
      severity === "attention"
        ? dt("dashboard.attentionRecAttention", { name: declining.name, defaultValue: "Review recent {{name}} activities and note any change in daily routine." })
        : dt("dashboard.attentionRecMonitor", { name: declining.name, defaultValue: "Keep monitoring {{name}} over the next few sessions." }),
  };
}

export type AttentionState = ReturnType<typeof getAttentionState>;

/* ── Monitoring status ──────────────────────────────────────────────────── */

function statusLabel(id: MonitoringStatusId): string {
  return dt(
    id === "stable" ? "dashboard.statusStable" : id === "monitoring" ? "dashboard.statusMonitoring" : "dashboard.statusAttention",
    { defaultValue: id },
  );
}

function statusDescription(id: MonitoringStatusId): string {
  return dt(
    id === "stable" ? "dashboard.statusDescStable" : id === "monitoring" ? "dashboard.statusDescMonitoring" : "dashboard.statusDescAttention",
    { defaultValue: id },
  );
}

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

  return { id, label: statusLabel(id), description: statusDescription(id) };
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
        ? dt("dashboard.insightTrendUp", { defaultValue: "Overall performance is trending upward." })
        : performance.direction === "down"
          ? dt("dashboard.insightTrendDown", { defaultValue: "Overall performance is lower than last week." })
          : dt("dashboard.insightTrendFlat", { defaultValue: "Overall performance is unchanged from last week." }),
    detail: dt("dashboard.insightTrendDetail", {
      current: performance.current,
      previous: performance.previous,
      defaultValue: "Performance Index {{current}}, compared with an average of {{previous}} the previous week.",
    }),
  });

  insights.push({
    id: "activity",
    tone: activity.level === "high" ? "positive" : activity.level === "moderate" ? "neutral" : "watch",
    title: activity.interpretation,
    detail: dt("dashboard.insightActivityDetail", {
      active: activity.activeDays,
      window: activity.windowDays,
      average: activity.averageSessionMinutes,
      streak: streak.current,
      defaultValue: "{{active}} of the last {{window}} days active · {{average}} min average session · {{streak}}-day current streak.",
    }),
  });

  insights.push({
    id: "strength",
    tone: "positive",
    title: dt("dashboard.insightStrengthTitle", { name: strongest.name, defaultValue: "{{name}} is currently the strongest area." }),
    detail: dt("dashboard.insightStrengthDetail", {
      score: strongest.score,
      activity: strongest.relatedActivity,
      when: strongest.relatedActivityWhen,
      defaultValue: "Score {{score}} out of 100. Most recent related activity: {{activity}}, {{when}}.",
    }),
  });

  if (declining) {
    insights.push({
      id: "monitor",
      tone: "watch",
      title: dt("dashboard.insightMonitorTitle", { name: declining.name, defaultValue: "{{name}} is the area to monitor." }),
      detail: dt("dashboard.insightMonitorDetail", {
        drop: Math.abs(declining.changePercent),
        previous: declining.previousScore,
        current: declining.score,
        activity: declining.relatedActivity,
        when: declining.relatedActivityWhen,
        defaultValue: "Down {{drop}}% from last week ({{previous}} to {{current}}). Related activity: {{activity}}, {{when}}.",
      }),
    });
  } else if (improving) {
    insights.push({
      id: "improving",
      tone: "positive",
      title: dt("dashboard.insightImprovingTitle", { name: improving.name, defaultValue: "{{name}} has improved since last week." }),
      detail: dt("dashboard.insightImprovingDetail", {
        change: improving.changePercent,
        previous: improving.previousScore,
        current: improving.score,
        defaultValue: "Up {{change}}% ({{previous}} to {{current}}).",
      }),
    });
  }

  return insights;
}

/* ── Performance by activity ────────────────────────────────────────────── */

export function getGamePerformance() {
  const games = dashboardData.gameScores
    .map((game) => {
      const changePercent = percentChange(game.score, game.previousScore);
      return { ...game, name: gameTitle(game.name), focus: focusLabel(game.focus), changePercent, direction: directionOf(changePercent) };
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
    focusInsight: dt("dashboard.focusInsight", {
      focus: focusLabel(strongestFocus),
      defaultValue: "{{focus}}-focused activities currently show the strongest performance.",
    }),
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

