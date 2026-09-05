// ─── React access to the people repository ───

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import {
  createPerson,
  getCachedPeople,
  isPeopleStorageAvailable,
  loadPeople,
  setPersonActive,
  subscribeToPeople,
  updatePerson,
} from "@/data/peopleRepository";
import { type Person, type PersonDraft, selectActivePeople } from "@/data/peopleTypes";

/** Stable empty reference, so a loading render never churns memoised values. */
const NO_PEOPLE: Person[] = [];

export interface UsePeopleResult {
  /** Every person, active and inactive, in caregiver display order. */
  people: Person[];
  /** The people eligible for newly generated questions. */
  activePeople: Person[];
  isLoading: boolean;
  /** False when this session is memory-only (local storage unavailable). */
  storageAvailable: boolean;
  addPerson: (draft: PersonDraft) => Promise<void>;
  editPerson: (id: string, draft: PersonDraft) => Promise<void>;
  setActive: (id: string, active: boolean) => Promise<void>;
}

/**
 * Subscribes to the shared people cache. Every consumer sees the same records,
 * so a caregiver edit is reflected in the game without a reload.
 */
export function usePeople(): UsePeopleResult {
  const snapshot = useSyncExternalStore(subscribeToPeople, getCachedPeople);

  useEffect(() => {
    void loadPeople();
  }, []);

  const people = snapshot ?? NO_PEOPLE;
  const activePeople = useMemo(() => selectActivePeople(people), [people]);

  const addPerson = useCallback(async (draft: PersonDraft) => {
    await createPerson(draft);
  }, []);

  const editPerson = useCallback(async (id: string, draft: PersonDraft) => {
    await updatePerson(id, draft);
  }, []);

  const setActive = useCallback(async (id: string, active: boolean) => {
    await setPersonActive(id, active);
  }, []);

  return {
    people,
    activePeople,
    isLoading: snapshot === null,
    storageAvailable: isPeopleStorageAvailable(),
    addPerson,
    editPerson,
    setActive,
  };
}
