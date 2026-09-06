// ─── Centralized text labels for voice-ready UI ───
// All user-facing strings are defined here so they can later be
// connected to Text-to-Speech, i18n, or regional language support.

import { MIN_ACTIVE_PEOPLE } from "./gameConfig";
import i18n from "../../i18n";

export const GAME_LABELS = {
  // Game title & identity
  get gameTitle() { return i18n.t("games.whoIsThis.title"); },
  get gameSubtitle() { return i18n.t("games.whoIsThis.subtitle"); },

  // Intro screen
  get welcomeTitle() { return i18n.t("games.whoIsThis.welcomeTitle"); },
  get welcomeMessage() { return i18n.t("games.whoIsThis.welcomeMessage"); },
  get startButton() { return i18n.t("common.startGame"); },
  get currentDifficulty() { return i18n.t("games.whoIsThis.currentDifficulty"); },

  // Question screen
  get questionText() { return i18n.t("games.whoIsThis.questionText"); },
  get questionSubtext() { return i18n.t("games.whoIsThis.questionSubtext"); },
  questionProgress: (current: number, total: number) => i18n.t("games.whoIsThis.questionProgress", { current, total }),
  /** Neutral alt text: naming the photo would give the answer away. */
  get questionPhotoAlt() { return i18n.t("games.whoIsThis.questionPhotoAlt"); },

  // Feedback
  get correctTitle() { return i18n.t("common.correct"); },
  get incorrectTitle() { return i18n.t("common.incorrect"); },
  /**
   * The one sentence that turns a right or wrong answer into reinforcement:
   * "This is Rajesh Kumar, your son." Built from the stored Person, so a
   * caregiver's edit changes what the patient hears next time.
   *
   * `relationship` is null when there is nothing to say (an "Other" record with
   * no label), and the clause is dropped rather than left empty.
   */
  personIdentity: (name: string, relationship: string | null) => relationship === null
    ? i18n.t("games.whoIsThis.personIdentity", { name })
    : i18n.t("games.whoIsThis.personIdentity", { name }) + i18n.t("games.whoIsThis.personIdentityClause", { relationship: relationship.toLowerCase() }),
  /** The same sentence in two pieces, so the clause can be styled as secondary. */
  personIdentityLead: (name: string) => i18n.t("games.whoIsThis.personIdentity", { name }).replace(/[.!]$/, ""),
  personIdentityClause: (relationship: string) => i18n.t("games.whoIsThis.personIdentityClause", { relationship: relationship.toLowerCase() }),
  personPhotoAlt: (name: string) => i18n.t("games.whoIsThis.personPhotoAlt", { name }),

  // Navigation
  get continueButton() { return i18n.t("common.continue"); },
  get nextQuestion() { return i18n.t("games.whoIsThis.nextQuestion"); },
  get backToGames() { return i18n.t("common.backToGames"); },

  // Session summary
  get summaryTitle() { return i18n.t("games.whoIsThis.summaryTitle"); },
  get summaryMessage() { return i18n.t("games.whoIsThis.summaryMessage"); },
  get summaryEncouragement() { return i18n.t("games.whoIsThis.summaryEncouragement"); },
  get scoreLabel() { return i18n.t("games.whoIsThis.scoreLabel"); },
  get accuracyLabel() { return i18n.t("games.whoIsThis.accuracyLabel"); },
  get avgResponseTimeLabel() { return i18n.t("games.whoIsThis.avgResponseTimeLabel"); },
  get difficultyLabel() { return i18n.t("games.whoIsThis.difficultyLabel"); },
  get playAgainButton() { return i18n.t("common.playAgain"); },
  get secondsUnit() { return i18n.t("games.whoIsThis.secondsUnit"); },

  // Difficulty labels
  get difficultyEasy() { return i18n.t("games.whoIsThis.difficultyEasy"); },
  get difficultyMedium() { return i18n.t("games.whoIsThis.difficultyMedium"); },
  get difficultyHard() { return i18n.t("games.whoIsThis.difficultyHard"); },

  // Error / fallback
  get photoUnavailable() { return i18n.t("games.whoIsThis.photoUnavailable"); },
  /** Shown instead of the game when the caregiver has too few active people. */
  get notEnoughPeople() { return i18n.t("games.whoIsThis.notEnoughPeople", { count: MIN_ACTIVE_PEOPLE }); },
  get notEnoughPeopleHint() { return i18n.t("games.whoIsThis.notEnoughPeopleHint"); },
  get manageDataButton() { return i18n.t("games.whoIsThis.manageDataButton"); },
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
