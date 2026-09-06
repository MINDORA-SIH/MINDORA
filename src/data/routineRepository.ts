import {
  getAllRecords,
  putRecord,
  STORE_ROUTINES,
  STORE_ROUTINE_SESSIONS,
} from "./mindoraDb"
import {
  DEFAULT_CAREGIVER_ID,
  DEFAULT_PATIENT,
  type Routine,
  type RoutineDraft,
  type RoutineGameSession,
  type RoutineStep,
} from "./routineTypes"

type Listener = (routines: Routine[]) => void
let cache: Routine[] | null = null
let loading: Promise<Routine[]> | null = null
let storageAvailable = true
const listeners = new Set<Listener>()

function id(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}
function publish(): void {
  for (const listener of listeners) listener(cache ?? [])
}
function commit(routines: Routine[]): Routine[] {
  cache = [...routines].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  publish()
  return cache
}
async function persist(
  record: Routine | RoutineGameSession,
  store: string,
): Promise<void> {
  if (!storageAvailable) return
  try {
    await putRecord(store, record)
  } catch {
    storageAvailable = false
  }
}
function normalizedSteps(steps: readonly RoutineStep[]): RoutineStep[] {
  return steps.map((step, index) => ({
    ...step,
    id: step.id || id("routine-step"),
    title: step.title.trim(),
    order: index + 1,
  }))
}

export function loadRoutines(): Promise<Routine[]> {
  if (cache) return Promise.resolve(cache)
  if (loading) return loading
  loading = (async () => {
    try {
      return commit(await getAllRecords<Routine>(STORE_ROUTINES))
    } catch {
      storageAvailable = false
      return commit([])
    }
  })()
  return loading
}
export function getCachedRoutines(): Routine[] | null {
  return cache
}
export function subscribeToRoutines(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
export function isRoutineStorageAvailable(): boolean {
  return storageAvailable
}

export async function createRoutine(
  patientId: string,
  draft: RoutineDraft,
): Promise<Routine> {
  const routines = await loadRoutines()
  const now = new Date().toISOString()
  const routine: Routine = {
    id: id("routine"),
    patientId,
    caregiverId: DEFAULT_CAREGIVER_ID,
    name: draft.name.trim(),
    description: draft.description?.trim() || undefined,
    category: draft.category,
    difficulty: draft.difficulty,
    active: draft.active,
    steps: normalizedSteps(draft.steps),
    createdAt: now,
    updatedAt: now,
  }
  commit([...routines, routine])
  await persist(routine, STORE_ROUTINES)
  return routine
}
export async function updateRoutine(
  routineId: string,
  draft: RoutineDraft,
): Promise<Routine> {
  const routines = await loadRoutines()
  const existing = routines.find((routine) => routine.id === routineId)
  if (!existing) throw new Error("Routine not found.")
  const updated: Routine = {
    ...existing,
    name: draft.name.trim(),
    description: draft.description?.trim() || undefined,
    category: draft.category,
    difficulty: draft.difficulty,
    active: draft.active,
    steps: normalizedSteps(draft.steps),
    updatedAt: new Date().toISOString(),
  }
  commit(
    routines.map((routine) => (routine.id === routineId ? updated : routine)),
  )
  await persist(updated, STORE_ROUTINES)
  return updated
}
export async function deleteRoutine(routineId: string): Promise<void> {
  const routines = await loadRoutines()
  const existing = routines.find((routine) => routine.id === routineId)
  if (!existing) return
  const updated = {
    ...existing,
    active: false,
    deletedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  commit(
    routines.map((routine) => (routine.id === routineId ? updated : routine)),
  )
  await persist(updated, STORE_ROUTINES)
}
export async function saveRoutineSession(
  session: RoutineGameSession,
): Promise<void> {
  await persist(session, STORE_ROUTINE_SESSIONS)
}
export async function getRoutineSessions(
  patientId: string,
  routineId?: string,
): Promise<RoutineGameSession[]> {
  try {
    const sessions = await getAllRecords<RoutineGameSession>(
      STORE_ROUTINE_SESSIONS,
    )
    return sessions
      .filter(
        (session) =>
          session.patientId === patientId &&
          (!routineId || session.routineId === routineId),
      )
      .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
  } catch {
    return []
  }
}

/** Patient-safe fallback, used only when no caregiver routine is assigned. */
export function fallbackRoutine(): Routine {
  const now = new Date().toISOString()
  const names = [
    ["Wake up", "🌅"],
    ["Brush teeth", "🪥"],
    ["Take medicine", "💊"],
    ["Eat breakfast", "🥣"],
    ["Go for a walk", "🚶"],
  ] as const
  return {
    id: "fallback-morning-routine",
    patientId: DEFAULT_PATIENT.id,
    caregiverId: DEFAULT_CAREGIVER_ID,
    name: "Morning Routine",
    description: "A simple morning routine",
    category: "morning",
    difficulty: 2,
    active: true,
    createdAt: now,
    updatedAt: now,
    steps: names.map(([title, icon], index) => ({
      id: `fallback-step-${index + 1}`,
      title,
      icon,
      order: index + 1,
      enabled: true,
    })),
  }
}
