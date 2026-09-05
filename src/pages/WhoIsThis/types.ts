// ─── Type definitions for the "Who Is This?" game ───

export type Difficulty = "easy" | "medium" | "hard";

export type GameState = "intro" | "playing" | "feedback" | "completed";

export interface Person {
  id: string;
  name: string;
  relationship: string;
  photo: string;
  description?: string;
  emoji?: string;
  color?: string;
  lastShown?: number;
}

export interface GameQuestion {
  id: string;
  correctPersonId: string;
  options: Person[];
  difficulty: Difficulty;
  startedAt: number;
}

export interface GameResponse {
  questionId: string;
  selectedPersonId: string;
  correctPersonId: string;
  isCorrect: boolean;
  responseTimeMs: number;
  difficulty: Difficulty;
  timestamp: number;
}

export interface GameSession {
  id: string;
  startedAt: number;
  completedAt?: number;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  averageResponseTime: number;
  difficulty: Difficulty;
}

export interface GameSettings {
  userId: string;
  currentDifficulty: Difficulty;
  lastPlayed?: number;
}

