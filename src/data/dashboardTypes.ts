/**
 * Shared types for the caregiver dashboard data layer.
 *
 * These describe the shape a real API would return, so `dashboardData.ts`
 * (mock) can be swapped out without touching any component.
 */

export type MonitoringStatusId = "stable" | "monitoring" | "attention"
export type ActivityLevelId = "high" | "moderate" | "low" | "none"
export type TrendDirection = "up" | "down" | "flat"
export type TrendRangeId = "7d" | "30d" | "3m"
export type AttentionSeverity = "none" | "monitor" | "attention"
export type CalendarDayStatus = "completed" | "partial" | "none" | "future"
export type InsightTone = "positive" | "neutral" | "watch"

export type GameIconName = "users" | "file-text" | "eye" | "grid" | "music" | "list-check"
export type GameAccent = "rose" | "sky" | "violet" | "amber" | "green" | "teal"

export type CognitiveParameterId = "memory" | "recognition" | "reasoning" | "language" | "executive-function" | "attention" | "processing-speed"

/** One day of recorded platform use. */
export interface DaySession {
  gamesCompleted: number
  sessionMinutes: number
  performanceIndex: number
  strongestArea: string
  areaToMonitor: string
  /** A single short activity rather than a full session. */
  partial?: boolean
}

export interface DayRecord {
  isoDate: string
  year: number
  monthIndex: number
  day: number
  weekday: number
  status: CalendarDayStatus
  isToday: boolean
  session?: DaySession
}

export interface CalendarMonth {
  id: string
  label: string
  year: number
  monthIndex: number
  firstWeekday: number
  days: DayRecord[]
}

export interface CognitiveParameter {
  id: CognitiveParameterId
  name: string
  /** Compact label used by the radar profile. */
  shortName: string
  score: number
  previousScore: number
  relatedActivity: string
  relatedActivityIso: string
}

export interface SessionRecord {
  id: string
  gameName: string
  icon: GameIconName
  accent: GameAccent
  isoDate: string
  timeLabel: string
  minutes: number
  score: number
}

export interface GameScore {
  id: string
  name: string
  focus: string
  score: number
  previousScore: number
  icon: GameIconName
  accent: GameAccent
}

export interface Patient {
  name: string
  initials: string
  age: number
  carePlan: string
  careSummary: string
}

/** One day of the Performance Index history series. */
export interface IndexPoint {
  isoDate: string
  score: number
}
