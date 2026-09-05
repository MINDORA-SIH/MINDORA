// ─── Question generation and game logic ───
import type { Difficulty, GameQuestion, Person } from "./types";

/**
 * Fisher-Yates shuffle — returns a new shuffled array.
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * How many answer options to show based on difficulty.
 * If fewer people are available, the count is clamped automatically.
 */
export function getOptionsCount(
  difficulty: Difficulty,
  availablePeopleCount: number,
): number {
  let target: number;
  switch (difficulty) {
    case "easy":
      target = 3;
      break;
    case "medium":
      // randomly 4 or 5
      target = Math.random() < 0.5 ? 4 : 5;
      break;
    case "hard":
      target = 6;
      break;
  }
  return Math.min(target, availablePeopleCount);
}

/**
 * Generate a single game question.
 *
 * @param people        — The full pool of people available.
 * @param difficulty    — Current difficulty level.
 * @param recentPersonIds — IDs of people shown recently, to reduce repetition.
 */
export function generateQuestion(
  people: Person[],
  difficulty: Difficulty,
  recentPersonIds: string[] = [],
): GameQuestion {
  if (people.length < 2) {
    throw new Error("Need at least 2 people to generate a question.");
  }

  const optionsCount = getOptionsCount(difficulty, people.length);

  // ── Pick the correct person ──
  // Prefer people who haven't been shown recently.
  const notRecentlyShown = people.filter(
    (p) => !recentPersonIds.includes(p.id),
  );
  const candidatePool =
    notRecentlyShown.length > 0 ? notRecentlyShown : people;

  // Among candidates, prefer those with an older (or missing) lastShown timestamp
  const sorted = [...candidatePool].sort(
    (a, b) => (a.lastShown ?? 0) - (b.lastShown ?? 0),
  );

  // Pick from the top half to add some randomness but still favour less-seen people
  const topHalf = sorted.slice(0, Math.max(1, Math.ceil(sorted.length / 2)));
  const correctPerson = topHalf[Math.floor(Math.random() * topHalf.length)];

  // ── Pick distractors ──
  const distractorPool = people.filter((p) => p.id !== correctPerson.id);
  const shuffledDistractors = shuffleArray(distractorPool);
  const distractors = shuffledDistractors.slice(0, optionsCount - 1);

  // ── Combine and shuffle options ──
  const options = shuffleArray([correctPerson, ...distractors]);

  return {
    id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    correctPersonId: correctPerson.id,
    options,
    difficulty,
    startedAt: Date.now(),
  };
}

