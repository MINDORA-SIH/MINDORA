// ─── Centralized text labels for voice-ready UI ───
// All user-facing strings are defined here so they can later be
// connected to Text-to-Speech, i18n, or regional language support.

import { MIN_ACTIVE_PEOPLE } from "./gameConfig";

export const GAME_LABELS = {
  // Game title & identity
  gameTitle: "Who Is This?",
  gameSubtitle: "Identify your family members",

  // Intro screen
  welcomeTitle: "Memory Game",
  welcomeMessage:
    "Look at the photo and choose the person's name. Take your time — there is no rush.",
  startButton: "Start Game",
  currentDifficulty: "Current Difficulty",

  // Question screen
  questionText: "Who is this person?",
  questionSubtext: "Choose the correct name.",
  questionProgress: (current: number, total: number) => `Question ${current} of ${total}`,
  /** Neutral alt text: naming the photo would give the answer away. */
  questionPhotoAlt: "Photo of the person to identify",

  // Feedback
  correctTitle: "Correct!",
  incorrectTitle: "Not quite.",
  /**
   * The one sentence that turns a right or wrong answer into reinforcement:
   * "This is Rajesh Kumar, your son." Built from the stored Person, so a
   * caregiver's edit changes what the patient hears next time.
   *
   * `relationship` is null when there is nothing to say (an "Other" record with
   * no label), and the clause is dropped rather than left empty.
   */
  personIdentity: (name: string, relationship: string | null) =>
    relationship === null
      ? `This is ${name}.`
      : `This is ${name}, your ${relationship.toLowerCase()}.`,
  /** The same sentence in two pieces, so the clause can be styled as secondary. */
  personIdentityLead: (name: string) => `This is ${name}`,
  personIdentityClause: (relationship: string) => `, your ${relationship.toLowerCase()}.`,
  personPhotoAlt: (name: string) => `Photo of ${name}`,

  // Navigation
  continueButton: "Continue →",
  nextQuestion: "Let's try another one.",
  backToGames: "Back to Games",

  // Session summary
  summaryTitle: "Well Done!",
  summaryMessage: "You completed today's memory game.",
  summaryEncouragement: "Great work! Keep exercising your memory.",
  scoreLabel: "Score",
  accuracyLabel: "Accuracy",
  avgResponseTimeLabel: "Average Response Time",
  difficultyLabel: "Difficulty",
  playAgainButton: "Play Again",
  secondsUnit: "seconds",

  // Difficulty labels
  difficultyEasy: "Easy",
  difficultyMedium: "Medium",
  difficultyHard: "Hard",

  // Error / fallback
  photoUnavailable: "Photo unavailable",
  /** Shown instead of the game when the caregiver has too few active people. */
  notEnoughPeople: `Add at least ${MIN_ACTIVE_PEOPLE} people to start this game.`,
  notEnoughPeopleHint: "A caregiver can add them in Manage Data on the dashboard.",
  manageDataButton: "Open Manage Data",
} as const;

/** Map difficulty to a human-readable label */
export function difficultyLabel(d: "easy" | "medium" | "hard"): string {
  switch (d) {
    case "easy":
      return GAME_LABELS.difficultyEasy;
    case "medium":
      return GAME_LABELS.difficultyMedium;
    case "hard":
      return GAME_LABELS.difficultyHard;
  }
}
