import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react"
import {
  createRoutine,
  deleteRoutine,
  getCachedRoutines,
  isRoutineStorageAvailable,
  loadRoutines,
  subscribeToRoutines,
  updateRoutine,
} from "@/data/routineRepository"
import type { RoutineDraft } from "@/data/routineTypes"

const EMPTY: never[] = []
export function useRoutines(patientId: string, includeInactive = true) {
  const snapshot = useSyncExternalStore(subscribeToRoutines, getCachedRoutines)
  useEffect(() => {
    void loadRoutines()
  }, [])
  const routines = useMemo(
    () =>
      (snapshot ?? EMPTY).filter(
        (routine) =>
          routine.patientId === patientId &&
          !routine.deletedAt &&
          (includeInactive || routine.active),
      ),
    [snapshot, patientId, includeInactive],
  )
  return {
    routines,
    isLoading: snapshot === null,
    storageAvailable: isRoutineStorageAvailable(),
    create: useCallback(
      (draft: RoutineDraft) => createRoutine(patientId, draft),
      [patientId],
    ),
    update: useCallback(
      (id: string, draft: RoutineDraft) => updateRoutine(id, draft),
      [],
    ),
    remove: useCallback((id: string) => deleteRoutine(id), []),
  }
}
