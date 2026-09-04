export type CalendarDayStatus = "completed" | "missed" | "today";

export interface CalendarSession {
  gamesCompleted: number;
  performanceIndex: number;
  bestArea: string;
  sessionMinutes: number;
}

export interface CalendarDay {
  day: number;
  status: CalendarDayStatus;
  session?: CalendarSession;
}

export interface CognitiveScore {
  id: "memory" | "recognition" | "reasoning" | "attention" | "processing-speed" | "executive-function" | "language";
  name: string;
  score: number;
}

export interface GameScore {
  id: "who-is-this" | "story-quiz" | "spot-the-difference" | "pattern-recognition" | "word-sound-memory" | "daily-routine";
  name: string;
  score: number;
  icon: "users" | "file-text" | "eye" | "grid" | "music" | "list-check";
  accent: "rose" | "sky" | "violet" | "amber" | "green" | "teal";
}

const completedDays = new Set([1, 2, 4, 6, 8, 9, 10, 11, 13, 14, 16, 17, 18, 20, 22, 23, 24, 26, 27, 28, 29, 30]);

const sessionByDay: Record<number, CalendarSession> = {
  1: { gamesCompleted: 2, performanceIndex: 72, bestArea: "Memory", sessionMinutes: 9 },
  2: { gamesCompleted: 3, performanceIndex: 74, bestArea: "Recognition", sessionMinutes: 11 },
  4: { gamesCompleted: 3, performanceIndex: 78, bestArea: "Memory", sessionMinutes: 12 },
  5: { gamesCompleted: 2, performanceIndex: 78, bestArea: "Memory", sessionMinutes: 10 },
  6: { gamesCompleted: 4, performanceIndex: 77, bestArea: "Recognition", sessionMinutes: 14 },
  8: { gamesCompleted: 2, performanceIndex: 75, bestArea: "Reasoning", sessionMinutes: 8 },
  9: { gamesCompleted: 3, performanceIndex: 78, bestArea: "Memory", sessionMinutes: 12 },
  10: { gamesCompleted: 2, performanceIndex: 76, bestArea: "Language", sessionMinutes: 10 },
  11: { gamesCompleted: 3, performanceIndex: 80, bestArea: "Recognition", sessionMinutes: 13 },
  13: { gamesCompleted: 2, performanceIndex: 77, bestArea: "Memory", sessionMinutes: 9 },
  14: { gamesCompleted: 3, performanceIndex: 78, bestArea: "Memory", sessionMinutes: 12 },
  16: { gamesCompleted: 2, performanceIndex: 76, bestArea: "Reasoning", sessionMinutes: 10 },
  17: { gamesCompleted: 4, performanceIndex: 79, bestArea: "Recognition", sessionMinutes: 15 },
  18: { gamesCompleted: 3, performanceIndex: 78, bestArea: "Memory", sessionMinutes: 12 },
  20: { gamesCompleted: 2, performanceIndex: 77, bestArea: "Language", sessionMinutes: 9 },
  22: { gamesCompleted: 3, performanceIndex: 80, bestArea: "Recognition", sessionMinutes: 13 },
  23: { gamesCompleted: 2, performanceIndex: 79, bestArea: "Memory", sessionMinutes: 10 },
  24: { gamesCompleted: 3, performanceIndex: 78, bestArea: "Memory", sessionMinutes: 11 },
  26: { gamesCompleted: 2, performanceIndex: 76, bestArea: "Reasoning", sessionMinutes: 8 },
  27: { gamesCompleted: 3, performanceIndex: 79, bestArea: "Recognition", sessionMinutes: 12 },
  28: { gamesCompleted: 2, performanceIndex: 78, bestArea: "Memory", sessionMinutes: 10 },
  29: { gamesCompleted: 4, performanceIndex: 81, bestArea: "Recognition", sessionMinutes: 14 },
  30: { gamesCompleted: 3, performanceIndex: 80, bestArea: "Memory", sessionMinutes: 12 },
};

const calendarDays: CalendarDay[] = Array.from({ length: 30 }, (_, index) => {
  const day = index + 1;
  const isToday = day === 5;

  return {
    day,
    status: isToday ? "today" : completedDays.has(day) ? "completed" : "missed",
    session: sessionByDay[day],
  };
});

export const dashboardData = {
  userName: "Savitri",
  greeting: "Good Evening",
  summary: {
    streak: 7,
    longestStreak: 12,
    performanceIndex: 78,
    weeklyChange: 6,
    gamesCompleted: 48,
  },
  calendar: {
    month: "September",
    year: 2026,
    firstWeekday: 2,
    days: calendarDays,
  },
  cognitiveScores: [
    { id: "memory", name: "Memory", score: 80 },
    { id: "recognition", name: "Recognition", score: 80 },
    { id: "reasoning", name: "Reasoning", score: 70 },
    { id: "attention", name: "Attention", score: 60 },
    { id: "processing-speed", name: "Processing Speed", score: 50 },
    { id: "executive-function", name: "Executive Function", score: 62 },
    { id: "language", name: "Language", score: 70 },
  ] satisfies CognitiveScore[],
  weeklyPerformance: [
    { day: "Mon", score: 68 },
    { day: "Tue", score: 71 },
    { day: "Wed", score: 73 },
    { day: "Thu", score: 75 },
    { day: "Fri", score: 78 },
    { day: "Sat", score: 76 },
    { day: "Sun", score: 80 },
  ],
  attentionChange: 8,
  gameScores: [
    { id: "who-is-this", name: "Who is this?", score: 82, icon: "users", accent: "rose" },
    { id: "story-quiz", name: "Story Quiz", score: 76, icon: "file-text", accent: "sky" },
    { id: "spot-the-difference", name: "Spot the Difference", score: 68, icon: "eye", accent: "violet" },
    { id: "pattern-recognition", name: "Pattern Recognition", score: 70, icon: "grid", accent: "amber" },
    { id: "word-sound-memory", name: "Word-Sound Memory", score: 80, icon: "music", accent: "green" },
    { id: "daily-routine", name: "Daily Routine", score: 74, icon: "list-check", accent: "teal" },
  ] satisfies GameScore[],
};

const practiceRecommendation = {
  memory: { gameName: "Who Is This?", path: "/" },
  recognition: { gameName: "Spot the Difference", path: "/spot-the-difference" },
  reasoning: { gameName: "Spot the Difference", path: "/spot-the-difference" },
  attention: { gameName: "Spot the Difference", path: "/spot-the-difference" },
  "processing-speed": { gameName: "Spot the Difference", path: "/spot-the-difference" },
  "executive-function": { gameName: "Daily Routine", path: "/reminders" },
  language: { gameName: "Story Quiz", path: "/" },
} satisfies Record<CognitiveScore["id"], { gameName: string; path: string }>;

export function getDashboardInsights(data = dashboardData) {
  const strongestScore = Math.max(...data.cognitiveScores.map((item) => item.score));
  const weakestScore = Math.min(...data.cognitiveScores.map((item) => item.score));
  const strongest = data.cognitiveScores.find((item) => item.score === strongestScore) ?? data.cognitiveScores[0];
  const weakest = data.cognitiveScores.find((item) => item.score === weakestScore) ?? data.cognitiveScores[0];
  const bestGame = data.gameScores.reduce((best, game) => game.score > best.score ? game : best, data.gameScores[0]);

  return {
    strongest,
    weakest,
    bestGame,
    recommendation: practiceRecommendation[weakest.id],
    weeklyTrendText: data.summary.weeklyChange >= 0
      ? `Up ${data.summary.weeklyChange}% from last week`
      : `${Math.abs(data.summary.weeklyChange)}% lower than last week`,
  };
}
