// ─── Type definitions for the "Who Is This?" game ───
//
// The person model is shared app-wide (`@/data/peopleTypes`): the caregiver owns
// those records and other activities will read the same ones. It is re-exported
// here so every module in this folder keeps importing its types from one place.

import type { Person } from "@/data/peopleTypes"

export type { Person, PersonDraft, Relationship } from "@/data/peopleTypes"

export type Difficulty = "easy" | "medium" | "hard"

export type GameState = "intro" | "playing" | "feedback" | "completed"

export interface GameQuestion {
  id: string
  correctPersonId: string
  /** The four people whose names are offered as answers. */
  options: Person[]
  difficulty: Difficulty
  startedAt: number
}

/**
 * One answered question.
 *
 * People are referenced by id, never by name, so a caregiver renaming someone
 * leaves historical responses pointing at the same person.
 */
export interface GameResponse {
  questionId: string
  selectedPersonId: string
  correctPersonId: string
  isCorrect: boolean
  responseTimeMs: number
  difficulty: Difficulty
  timestamp: number
}

export interface GameSession {
  id: string
  startedAt: number
  completedAt?: number
  score: number
  totalQuestions: number
  correctAnswers: number
  accuracy: number
  averageResponseTime: number
  difficulty: Difficulty
}

export interface GameSettings {
  userId: string
  currentDifficulty: Difficulty
  lastPlayed?: number
}
