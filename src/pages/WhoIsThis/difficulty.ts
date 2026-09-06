// ─── Adaptive difficulty engine ───
import type { Difficulty, GameResponse } from "./types"

/** How many recent responses to evaluate for difficulty adaptation */
const ADAPTATION_WINDOW = 5

/** Accuracy thresholds */
const INCREASE_THRESHOLD = 0.8 // >80% → harder
const DECREASE_THRESHOLD = 0.5 // <50% → easier

/** Average response time thresholds (milliseconds) */
const FAST_RESPONSE_MS = 3000 // consistently fast = bonus difficulty bump
const SLOW_RESPONSE_MS = 8000 // consistently slow = consider lowering

/**
 * Calculate accuracy from an array of responses.
 */
export function calculateAccuracy(responses: GameResponse[]): number {
  if (responses.length === 0) return 0
  const correct = responses.filter((r) => r.isCorrect).length
  return correct / responses.length
}

/**
 * Calculate average response time in milliseconds.
 */
export function calculateAverageResponseTime(
  responses: GameResponse[],
): number {
  if (responses.length === 0) return 0
  const total = responses.reduce((sum, r) => sum + r.responseTimeMs, 0)
  return total / responses.length
}

/**
 * Increase difficulty one step.
 */
function increaseDifficulty(current: Difficulty): Difficulty {
  switch (current) {
    case "easy":
      return "medium"
    case "medium":
      return "hard"
    case "hard":
      return "hard"
  }
}

/**
 * Decrease difficulty one step.
 */
function decreaseDifficulty(current: Difficulty): Difficulty {
  switch (current) {
    case "easy":
      return "easy"
    case "medium":
      return "easy"
    case "hard":
      return "medium"
  }
}

/**
 * Determine the adaptive difficulty based on recent performance.
 *
 * Rules:
 * - Evaluates the last `ADAPTATION_WINDOW` responses.
 * - If accuracy > 80%  → increase difficulty.
 * - If accuracy < 50%  → decrease difficulty.
 * - If accuracy is 50–80% → keep current.
 * - If the user answers quickly AND correctly → extra nudge up.
 * - If the user answers slowly AND incorrectly → extra nudge down.
 *
 * Does NOT change difficulty if fewer than ADAPTATION_WINDOW responses exist,
 * to avoid premature jumps.
 */
export function getAdaptiveDifficulty(
  allResponses: GameResponse[],
  currentDifficulty: Difficulty,
): Difficulty {
  // Need at least a full window before adapting
  if (allResponses.length < ADAPTATION_WINDOW) {
    return currentDifficulty
  }

  const recentResponses = allResponses.slice(-ADAPTATION_WINDOW)
  const accuracy = calculateAccuracy(recentResponses)
  const avgTime = calculateAverageResponseTime(recentResponses)

  // High accuracy
  if (accuracy > INCREASE_THRESHOLD) {
    // If also fast, definitely increase
    if (avgTime < FAST_RESPONSE_MS) {
      return increaseDifficulty(currentDifficulty)
    }
    // High accuracy but slower — still increase
    return increaseDifficulty(currentDifficulty)
  }

  // Low accuracy
  if (accuracy < DECREASE_THRESHOLD) {
    // If also slow, definitely decrease
    if (avgTime > SLOW_RESPONSE_MS) {
      return decreaseDifficulty(currentDifficulty)
    }
    // Low accuracy — decrease
    return decreaseDifficulty(currentDifficulty)
  }

  // Mid-range accuracy — check time as a tiebreaker
  if (accuracy >= DECREASE_THRESHOLD && accuracy <= INCREASE_THRESHOLD) {
    if (avgTime < FAST_RESPONSE_MS && accuracy >= 0.7) {
      // Reasonably accurate and fast — nudge up
      return increaseDifficulty(currentDifficulty)
    }
    if (avgTime > SLOW_RESPONSE_MS && accuracy <= 0.6) {
      // Somewhat inaccurate and slow — nudge down
      return decreaseDifficulty(currentDifficulty)
    }
  }

  return currentDifficulty
}
