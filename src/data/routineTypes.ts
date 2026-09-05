export const ROUTINE_CATEGORIES = ["morning", "afternoon", "evening", "bedtime", "custom"] as const;
export type RoutineCategory = (typeof ROUTINE_CATEGORIES)[number];
export type RoutineDifficulty = 1 | 2 | 3 | 4;

export interface RoutineStep {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  order: number;
  scheduledTime?: string;
  hint?: string;
  enabled: boolean;
}

export interface Routine {
  id: string;
  patientId: string;
  /** This client-only app has one local caregiver; retained for future API authorization. */
  caregiverId: string;
  name: string;
  description?: string;
  category: RoutineCategory;
  steps: RoutineStep[];
  difficulty: RoutineDifficulty;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  /** Soft deletion preserves prior game session references. */
  deletedAt?: string;
}

export interface RoutineDraft {
  name: string;
  description?: string;
  category: RoutineCategory;
  difficulty: RoutineDifficulty;
  active: boolean;
  steps: RoutineStep[];
}

export interface RoutineGameSession {
  id: string;
  patientId: string;
  routineId: string;
  startedAt: string;
  completedAt?: string;
  difficulty: RoutineDifficulty;
  score: number;
  accuracy: number;
  errors: number;
  hintsUsed: number;
  retries: number;
  completionTimeMs: number;
}

/** Stable local identity for the care recipient shown by the existing dashboard. */
export const DEFAULT_PATIENT = { id: "patient-savitri-devi", name: patientProfile.name } as const;
export const DEFAULT_CAREGIVER_ID = "caregiver-local";

export const PREDEFINED_ACTIVITIES = [
  ["Wake up", "🌅"], ["Brush teeth", "🪥"], ["Take medicine", "💊"], ["Drink water", "💧"],
  ["Eat breakfast", "🥣"], ["Take a bath", "🛁"], ["Get dressed", "👕"], ["Read newspaper", "📰"],
  ["Go for a walk", "🚶"], ["Have lunch", "🥗"], ["Rest", "🛋️"], ["Exercise", "🤸"],
  ["Talk with family", "👨‍👩‍👧"], ["Dinner", "🍽️"], ["Prepare for bed", "🌙"], ["Go to sleep", "😴"],
] as const;

export function orderedEnabledSteps(routine: Routine): RoutineStep[] {
  return routine.steps.filter((step) => step.enabled).sort((a, b) => a.order - b.order);
}

/** A new array only: caregiver order is never mutated by gameplay. */
export function shuffleSteps(steps: readonly RoutineStep[]): RoutineStep[] {
  const shuffled = [...steps];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const next = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[next]] = [shuffled[next], shuffled[index]];
  }
  return shuffled;
}

export function stepsForDifficulty(routine: Routine): RoutineStep[] {
  const count = [3, 5, 7, Number.POSITIVE_INFINITY][routine.difficulty - 1];
  return orderedEnabledSteps(routine).slice(0, count);
}

export function categoryLabel(category: RoutineCategory): string {
  return category.slice(0, 1).toUpperCase() + category.slice(1);
}
import { patientProfile } from "./dashboardSelectors";
