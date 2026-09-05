// ─── Centralized text labels for voice-ready UI ───
// All user-facing strings are defined here so they can later be
// connected to Text-to-Speech, i18n, or regional language support.

export const GAME_LABELS = {
  // Game title & identity
  gameTitle: "Who Is This?",
  gameSubtitle: "Identify your family members",

  // Intro screen
  welcomeTitle: "Memory Game",
  welcomeMessage:
    "Look at the photos and identify the person. Take your time — there is no rush.",
  startButton: "Start Game",
  currentDifficulty: "Current Difficulty",

  // Question screen
  questionText: "Who is this person?",
  questionSubtext: "Choose the correct person.",
  questionProgress: (current: number, total: number) =>
    `Question ${current} of ${total}`,

  // Feedback — correct
  correctTitle: "Correct!",
  correctDescription: (name: string, relationship: string) =>
    `This is ${name}, your ${relationship.toLowerCase()}.`,

  // Feedback — incorrect (gentle)
  incorrectTitle: "Not quite.",
  incorrectDescription: (name: string, relationship: string) =>
    `This is ${name}, your ${relationship.toLowerCase()}.`,

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
  notEnoughPeople: "Add more family members to play this game.",
} as const;

/** Map difficulty to a human-readable label */
export function difficultyLabel(
  d: "easy" | "medium" | "hard",
): string {
  switch (d) {
    case "easy":
      return GAME_LABELS.difficultyEasy;
    case "medium":
      return GAME_LABELS.difficultyMedium;
    case "hard":
      return GAME_LABELS.difficultyHard;
  }
}

