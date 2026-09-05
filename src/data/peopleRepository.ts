// ─── People repository ───
//
// The only module that reads or writes person records. React components go
// through `usePeople`, never through IndexedDB directly.
//
// An in-memory cache is the source of truth for the session and is mirrored to
// IndexedDB on a best-effort basis. If local storage is unavailable the
// caregiver can still add and edit people for the current session — the same
// degrade-gracefully rule the game's session storage already follows.

import {
  getAllRecords,
  putRecord,
  putRecords,
  STORE_PEOPLE,
} from "./mindoraDb";
import { buildSeedPeople } from "./peopleSeed";
import type { Person, PersonDraft } from "./peopleTypes";

type PeopleListener = (people: Person[]) => void;

let cache: Person[] | null = null;
let loadOnce: Promise<Person[]> | null = null;
let storageAvailable = true;
const listeners = new Set<PeopleListener>();

/** Caregiver display order: oldest record first, name as the tie-breaker. */
function sortPeople(people: readonly Person[]): Person[] {
  return [...people].sort(
    (a, b) => a.createdAt.localeCompare(b.createdAt) || a.name.localeCompare(b.name),
  );
}

function newPersonId(): string {
  return `person-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Empty `customRelationship` is dropped so it never lingers after an edit. */
function normalizeDraft(draft: PersonDraft): PersonDraft {
  const custom = draft.customRelationship?.trim();
  return {
    name: draft.name.trim(),
    relationship: draft.relationship,
    photo: draft.photo,
    ...(custom ? { customRelationship: custom } : {}),
  };
}

function publish(): void {
  const snapshot = cache ?? [];
  for (const listener of listeners) listener(snapshot);
}

function commit(people: Person[]): Person[] {
  cache = sortPeople(people);
  publish();
  return cache;
}

async function persist(person: Person): Promise<void> {
  if (!storageAvailable) return;
  try {
    await putRecord(STORE_PEOPLE, person);
  } catch {
    storageAvailable = false;
  }
}

/**
 * Reads every person, seeding the starter set the first time only.
 *
 * Concurrent callers (the game and the caregiver page can mount together) share
 * one load, so the seed can never be written twice.
 */
export function loadPeople(): Promise<Person[]> {
  if (cache) return Promise.resolve(cache);
  if (loadOnce) return loadOnce;

  loadOnce = (async () => {
    let stored: Person[] = [];
    try {
      stored = await getAllRecords<Person>(STORE_PEOPLE);
    } catch {
      storageAvailable = false;
    }

    if (stored.length > 0) return commit(stored);

    // Empty store — first run. Never runs again once anything is saved.
    const seeded = buildSeedPeople();
    if (storageAvailable) {
      try {
        await putRecords(STORE_PEOPLE, seeded);
      } catch {
        storageAvailable = false;
      }
    }
    return commit(seeded);
  })();

  return loadOnce;
}

/** Already-loaded people, or `null` before the first load resolves. */
export function getCachedPeople(): Person[] | null {
  return cache;
}

/** Notifies on every change, so open views stay in sync with each other. */
export function subscribeToPeople(listener: PeopleListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export async function createPerson(draft: PersonDraft): Promise<Person> {
  const people = await loadPeople();
  const now = new Date().toISOString();
  const person: Person = {
    id: newPersonId(),
    ...normalizeDraft(draft),
    active: true,
    createdAt: now,
    updatedAt: now,
  };

  commit([...people, person]);
  await persist(person);
  return person;
}

/**
 * Applies caregiver edits in place.
 *
 * `id` and `createdAt` are carried over untouched: renaming a person or
 * changing their relationship updates the same record, so responses already
 * recorded against that id stay attached to them.
 */
export async function updatePerson(
  id: string,
  draft: PersonDraft,
): Promise<Person> {
  const people = await loadPeople();
  const existing = people.find((person) => person.id === id);
  if (!existing) throw new Error(`No person with id "${id}".`);

  const next = normalizeDraft(draft);
  const updated: Person = {
    ...existing,
    ...next,
    // Assigned explicitly: a cleared "Other" label is absent from `next` and
    // would otherwise survive from `existing`.
    customRelationship: next.customRelationship,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  };

  commit(people.map((person) => (person.id === id ? updated : person)));
  await persist(updated);
  return updated;
}

/**
 * Soft delete / restore. Nothing is ever removed: an inactive person drops out
 * of newly generated questions and comes straight back when reactivated.
 */
export async function setPersonActive(
  id: string,
  active: boolean,
): Promise<Person> {
  const people = await loadPeople();
  const existing = people.find((person) => person.id === id);
  if (!existing) throw new Error(`No person with id "${id}".`);

  const updated: Person = {
    ...existing,
    active,
    updatedAt: new Date().toISOString(),
  };

  commit(people.map((person) => (person.id === id ? updated : person)));
  await persist(updated);
  return updated;
}

/** False once a read or write has failed — the session is memory-only. */
export function isPeopleStorageAvailable(): boolean {
  return storageAvailable;
}
