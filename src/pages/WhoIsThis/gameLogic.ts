// ─── Question generation ───
//
// A round shows one person's photo and four names. The photo is the question,
// the names are the answers: the patient's task stays image recognition → name
// identification. Relationship is never used to build the options.

import { MIN_ACTIVE_PEOPLE, OPTIONS_PER_QUESTION } from "./gameConfig";
import type { Difficulty, GameQuestion, Person } from "./types";

/** Fisher-Yates shuffle — returns a new shuffled array. */
export function shuffleArray<T>(array: readonly T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/** One entry per person: the same record can never fill two options. */
function dedupeById(people: readonly Person[]): Person[] {
  const seen = new Set<string>();
  return people.filter((person) => {
    if (seen.has(person.id)) return false;
    seen.add(person.id);
    return true;
  });
}

function nameKey(person: Person): string {
  return person.name.trim().toLowerCase();
}

/**
 * Draws distractors, preferring names that read differently from the ones
 * already on screen. Two people are allowed to share a name, and in that case
 * showing four options matters more than making every label unique.
 */
function pickDistractors(pool: readonly Person[], correct: Person, count: number): Person[] {
  const shuffled = shuffleArray(pool);
  const chosen: Person[] = [];
  const usedNames = new Set<string>([nameKey(correct)]);

  for (const person of shuffled) {
    if (chosen.length === count) break;
    const key = nameKey(person);
    if (usedNames.has(key)) continue;
    usedNames.add(key);
    chosen.push(person);
  }

  if (chosen.length < count) {
    const taken = new Set(chosen.map((person) => person.id));
    for (const person of shuffled) {
      if (chosen.length === count) break;
      if (taken.has(person.id)) continue;
      chosen.push(person);
    }
  }

  return chosen;
}

/**
 * Builds one round from the caregiver's active people.
 *
 * @param people          — Candidates. Inactive records are filtered out here too.
 * @param difficulty      — Recorded on the round for session tracking.
 * @param recentPersonIds — Recently asked people, avoided while alternatives exist.
 */
export function generateQuestion(
  people: readonly Person[],
  difficulty: Difficulty,
  recentPersonIds: readonly string[] = [],
): GameQuestion {
  const pool = dedupeById(people.filter((person) => person.active));

  if (pool.length < MIN_ACTIVE_PEOPLE) {
    throw new Error(
      `Need at least ${MIN_ACTIVE_PEOPLE} active people to generate a question.`,
    );
  }

  const notRecentlyShown = pool.filter((person) => !recentPersonIds.includes(person.id));
  const candidates = notRecentlyShown.length > 0 ? notRecentlyShown : pool;
  const correctPerson = candidates[Math.floor(Math.random() * candidates.length)];

  const distractors = pickDistractors(
    pool.filter((person) => person.id !== correctPerson.id),
    correctPerson,
    OPTIONS_PER_QUESTION - 1,
  );

  return {
    id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    correctPersonId: correctPerson.id,
    options: shuffleArray([correctPerson, ...distractors]),
    difficulty,
    startedAt: Date.now(),
  };
}
