import { useTranslation } from "react-i18next";
import { MIN_ACTIVE_PEOPLE } from "./gameConfig";

/** Localized labels for every Who Is This screen. */
export function useGameLabels() {
  const { t } = useTranslation();
  return {
    gameTitle: t("games.whoIsThis.title"),
    gameSubtitle: t("games.whoIsThis.subtitle"),
    welcomeTitle: t("games.whoIsThis.welcomeTitle"),
    welcomeMessage: t("games.whoIsThis.welcomeMessage"),
    startButton: t("common.startGame"),
    currentDifficulty: t("games.whoIsThis.currentDifficulty"),
    questionText: t("games.whoIsThis.questionText"),
    questionSubtext: t("games.whoIsThis.questionSubtext"),
    questionProgress: (current: number, total: number) =>
      t("games.whoIsThis.questionProgress", { current, total }),
    questionPhotoAlt: t("games.whoIsThis.questionPhotoAlt"),
    correctTitle: t("common.correct"),
    incorrectTitle: t("common.incorrect"),
    personIdentityLead: (name: string) => t("games.whoIsThis.personIdentity", { name }).replace(/\.$/, ""),
    personIdentityClause: (relationship: string) =>
      t("games.whoIsThis.personIdentityClause", { relationship: relationship.toLowerCase() }),
    personPhotoAlt: (name: string) => t("games.whoIsThis.personPhotoAlt", { name }),
    continueButton: t("common.continue"),
    backToGames: t("common.backToGames"),
    summaryTitle: t("games.whoIsThis.summaryTitle"),
    summaryMessage: t("games.whoIsThis.summaryMessage"),
    summaryEncouragement: t("games.whoIsThis.summaryEncouragement"),
    scoreLabel: t("games.whoIsThis.scoreLabel"),
    accuracyLabel: t("games.whoIsThis.accuracyLabel"),
    avgResponseTimeLabel: t("games.whoIsThis.avgResponseTimeLabel"),
    difficultyLabel: t("games.whoIsThis.difficultyLabel"),
    playAgainButton: t("common.playAgain"),
    secondsUnit: t("games.whoIsThis.secondsUnit"),
    difficultyEasy: t("games.whoIsThis.difficultyEasy"),
    difficultyMedium: t("games.whoIsThis.difficultyMedium"),
    difficultyHard: t("games.whoIsThis.difficultyHard"),
    notEnoughPeople: t("games.whoIsThis.notEnoughPeople", { count: MIN_ACTIVE_PEOPLE }),
    notEnoughPeopleHint: t("games.whoIsThis.notEnoughPeopleHint"),
    manageDataButton: t("games.whoIsThis.manageDataButton"),
  };
}

export function useDifficultyLabel() {
  const labels = useGameLabels();
  return (difficulty: "easy" | "medium" | "hard") => {
    if (difficulty === "easy") return labels.difficultyEasy;
    if (difficulty === "medium") return labels.difficultyMedium;
    return labels.difficultyHard;
  };
}
