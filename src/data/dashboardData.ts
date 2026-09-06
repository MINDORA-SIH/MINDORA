import type {
  CalendarMonth,
  CognitiveParameter,
  DayRecord,
  DaySession,
  GameScore,
  IndexPoint,
  Patient,
  SessionRecord,
} from "./dashboardTypes"

/**
 * Mock data source for the caregiver dashboard.
 *
 * Every number the dashboard renders originates here; `dashboardSelectors.ts`
 * turns it into derived values and caregiver-facing copy. Replacing this file
 * with an API response is the only change needed to go live.
 */

/** The mock "today". Becomes `new Date()` once real session data is wired in. */
export const TODAY_ISO = "2026-09-05"

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]
export const MONTH_ABBR = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]
export const WEEKDAY_ABBR = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
export const WEEKDAY_INITIALS = ["S", "M", "T", "W", "T", "F", "S"]

const DAY_MS = 86_400_000

export function isoOf(year: number, monthIndex: number, day: number): string {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

export function weekdayOf(
  year: number,
  monthIndex: number,
  day: number,
): number {
  return new Date(Date.UTC(year, monthIndex, day)).getUTCDay()
}

/* ── Recorded sessions per day ─────────────────────────────────────────── */

const septemberSessions: Record<number, DaySession> = {
  1: {
    gamesCompleted: 2,
    sessionMinutes: 11,
    performanceIndex: 74,
    strongestArea: "Memory",
    areaToMonitor: "Attention",
  },
  2: {
    gamesCompleted: 3,
    sessionMinutes: 13,
    performanceIndex: 76,
    strongestArea: "Recognition",
    areaToMonitor: "Processing Speed",
  },
  3: {
    gamesCompleted: 1,
    sessionMinutes: 5,
    performanceIndex: 71,
    strongestArea: "Memory",
    areaToMonitor: "Processing Speed",
    partial: true,
  },
  4: {
    gamesCompleted: 3,
    sessionMinutes: 14,
    performanceIndex: 78,
    strongestArea: "Memory",
    areaToMonitor: "Processing Speed",
  },
  5: {
    gamesCompleted: 2,
    sessionMinutes: 12,
    performanceIndex: 78,
    strongestArea: "Recognition",
    areaToMonitor: "Processing Speed",
  },
}

/**
 * August 2026 history, generated from a fixed weekly rhythm: rest on Sundays
 * and on 31 August, a short single activity on Thursdays, full sessions
 * otherwise.
 */
function augustSession(day: number): DaySession | undefined {
  const weekday = weekdayOf(2026, 7, day)
  if (weekday === 0 || day === 31) return undefined
  const base = 73 + Math.floor((day - 1) / 10)
  if (weekday === 4) {
    return {
      gamesCompleted: 1,
      sessionMinutes: 5,
      performanceIndex: base - 2,
      strongestArea: "Memory",
      areaToMonitor: "Processing Speed",
      partial: true,
    }
  }
  const gamesCompleted = day % 4 === 0 ? 3 : 2
  return {
    gamesCompleted,
    sessionMinutes: gamesCompleted === 3 ? 13 : 10,
    performanceIndex: base + (day % 3 === 0 ? 1 : 0),
    strongestArea: day % 2 === 0 ? "Recognition" : "Memory",
    areaToMonitor: day % 5 === 0 ? "Attention" : "Processing Speed",
  }
}

/* ── Participation calendar ────────────────────────────────────────────── */

function buildMonth(
  year: number,
  monthIndex: number,
  dayCount: number,
  sessionFor: (day: number) => DaySession | undefined,
): CalendarMonth {
  const days: DayRecord[] = Array.from({ length: dayCount }, (_, index) => {
    const day = index + 1
    const isoDate = isoOf(year, monthIndex, day)
    const isFuture = isoDate > TODAY_ISO
    const session = isFuture ? undefined : sessionFor(day)
    const status = isFuture
      ? "future"
      : !session
        ? "none"
        : session.partial
          ? "partial"
          : "completed"
    return {
      isoDate,
      year,
      monthIndex,
      day,
      weekday: weekdayOf(year, monthIndex, day),
      status,
      isToday: isoDate === TODAY_ISO,
      session,
    }
  })

  return {
    id: `${year}-${monthIndex}`,
    label: `${MONTH_NAMES[monthIndex]} ${year}`,
    year,
    monthIndex,
    firstWeekday: weekdayOf(year, monthIndex, 1),
    days,
  }
}

export const calendarMonths: CalendarMonth[] = [
  buildMonth(2026, 7, 31, augustSession),
  buildMonth(2026, 8, 30, (day) => septemberSessions[day]),
]

/** Every held day, oldest first, across month boundaries. */
export const allDays: DayRecord[] = calendarMonths.flatMap(
  (month) => month.days,
)

/* ── Performance Index history ──────────────────────────────────────────── */

/** Six months, so the 3-month view still has a comparison window behind it. */
const HISTORY_DAYS = 182

/**
 * Daily Performance Index, oldest first, ending today.
 *
 * Days covered by the calendar use their recorded session index (carried
 * forward across rest days). Earlier days come from a gentle upward baseline
 * so trend comparisons have history to compare against.
 */
function buildIndexHistory(): IndexPoint[] {
  const recorded = allDays.filter((day) => day.isoDate <= TODAY_ISO)
  const generatedCount = Math.max(HISTORY_DAYS - recorded.length, 0)
  const firstRecordedMs = Date.UTC(2026, 7, 1)
  const history: IndexPoint[] = []

  for (let index = 0; index < generatedCount; index++) {
    const isoDate = new Date(
      firstRecordedMs - (generatedCount - index) * DAY_MS,
    )
      .toISOString()
      .slice(0, 10)
    const progress = index / (HISTORY_DAYS - 1)
    const score = Math.round(
      68 +
        progress * 8 +
        Math.sin(index / 3.3) * 1.6 +
        Math.cos(index / 7.1) * 1.2,
    )
    history.push({ isoDate, score })
  }

  let carried = history.length ? history[history.length - 1].score : 73
  for (const day of recorded) {
    if (day.session) carried = day.session.performanceIndex
    history.push({ isoDate: day.isoDate, score: carried })
  }

  return history
}

/* ── Cognitive parameters ───────────────────────────────────────────────── */

const cognitiveParameters: CognitiveParameter[] = [
  {
    id: "memory",
    name: "Memory",
    shortName: "Memory",
    score: 80,
    previousScore: 77,
    relatedActivity: "Who Is This?",
    relatedActivityIso: "2026-09-05",
  },
  {
    id: "recognition",
    name: "Recognition",
    shortName: "Recognition",
    score: 80,
    previousScore: 80,
    relatedActivity: "Spot the Difference",
    relatedActivityIso: "2026-09-05",
  },
  {
    id: "reasoning",
    name: "Reasoning",
    shortName: "Reasoning",
    score: 70,
    previousScore: 66,
    relatedActivity: "Pattern Recognition",
    relatedActivityIso: "2026-09-04",
  },
  {
    id: "language",
    name: "Language",
    shortName: "Language",
    score: 70,
    previousScore: 69,
    relatedActivity: "Story Quiz",
    relatedActivityIso: "2026-09-04",
  },
  {
    id: "executive-function",
    name: "Executive Function",
    shortName: "Executive",
    score: 62,
    previousScore: 60,
    relatedActivity: "Daily Routine",
    relatedActivityIso: "2026-09-02",
  },
  {
    id: "attention",
    name: "Attention",
    shortName: "Attention",
    score: 60,
    previousScore: 61,
    relatedActivity: "Spot the Difference",
    relatedActivityIso: "2026-09-05",
  },
  {
    id: "processing-speed",
    name: "Processing Speed",
    shortName: "Speed",
    score: 50,
    previousScore: 57,
    relatedActivity: "Spot the Difference",
    relatedActivityIso: "2026-09-04",
  },
]

/* ── Activity performance ───────────────────────────────────────────────── */

const gameScores: GameScore[] = [
  {
    id: "who-is-this",
    name: "Who Is This?",
    focus: "Memory",
    score: 82,
    previousScore: 79,
    icon: "users",
    accent: "rose",
  },
  {
    id: "word-sound-memory",
    name: "Word-Sound Memory",
    focus: "Listening",
    score: 80,
    previousScore: 78,
    icon: "music",
    accent: "green",
  },
  {
    id: "story-quiz",
    name: "Story Quiz",
    focus: "Recall",
    score: 76,
    previousScore: 74,
    icon: "file-text",
    accent: "sky",
  },
  {
    id: "daily-routine",
    name: "Daily Routine",
    focus: "Sequencing",
    score: 74,
    previousScore: 73,
    icon: "list-check",
    accent: "teal",
  },
  {
    id: "pattern-recognition",
    name: "Pattern Recognition",
    focus: "Reasoning",
    score: 70,
    previousScore: 66,
    icon: "grid",
    accent: "amber",
  },
  {
    id: "spot-the-difference",
    name: "Spot the Difference",
    focus: "Focus",
    score: 68,
    previousScore: 74,
    icon: "eye",
    accent: "violet",
  },
]

/* ── Session history ────────────────────────────────────────────────────── */

const recentSessions: SessionRecord[] = [
  {
    id: "s-1",
    gameName: "Spot the Difference",
    icon: "eye",
    accent: "violet",
    isoDate: "2026-09-05",
    timeLabel: "10:42 AM",
    minutes: 8,
    score: 68,
  },
  {
    id: "s-2",
    gameName: "Who Is This?",
    icon: "users",
    accent: "rose",
    isoDate: "2026-09-05",
    timeLabel: "9:15 AM",
    minutes: 4,
    score: 82,
  },
  {
    id: "s-3",
    gameName: "Story Quiz",
    icon: "file-text",
    accent: "sky",
    isoDate: "2026-09-04",
    timeLabel: "4:15 PM",
    minutes: 6,
    score: 76,
  },
  {
    id: "s-4",
    gameName: "Pattern Recognition",
    icon: "grid",
    accent: "amber",
    isoDate: "2026-09-04",
    timeLabel: "11:30 AM",
    minutes: 5,
    score: 70,
  },
  {
    id: "s-5",
    gameName: "Word-Sound Memory",
    icon: "music",
    accent: "green",
    isoDate: "2026-09-04",
    timeLabel: "9:40 AM",
    minutes: 3,
    score: 80,
  },
  {
    id: "s-6",
    gameName: "Who Is This?",
    icon: "users",
    accent: "rose",
    isoDate: "2026-09-03",
    timeLabel: "11:20 AM",
    minutes: 5,
    score: 82,
  },
]

/* ── The dataset the dashboard consumes ─────────────────────────────────── */

const patient: Patient = {
  name: "Savitri Devi",
  initials: "SD",
  age: 72,
  carePlan: "Active",
  careSummary: "Home care · Daily cognitive activities",
}

export const dashboardData = {
  patient,
  /** Longest participation streak on record, for context next to the current one. */
  streakRecord: { longest: 12 },
  disclaimer:
    "Performance indicators are based on in-app activity data and are not a clinical diagnosis.",
  cognitiveParameters,
  gameScores,
  recentSessions,
  calendarMonths,
  allDays,
  indexHistory: buildIndexHistory(),
  todayIso: TODAY_ISO,
}

export type DashboardData = typeof dashboardData
