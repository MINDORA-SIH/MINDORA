// ─── IndexedDB storage layer for the "Who Is This?" game ───
//
// All operations are wrapped in try/catch so the game works even if
// IndexedDB is unavailable (e.g. private browsing, storage quota).
// In that case the game runs in memory-only mode.

import type {
  GameResponse,
  GameSession,
  GameSettings,
  Person,
} from "./types";

const DB_NAME = "mindora-who-is-this";
const DB_VERSION = 1;

// Object store names
const STORE_PEOPLE = "people";
const STORE_RESPONSES = "gameResponses";
const STORE_SESSIONS = "gameSessions";
const STORE_SETTINGS = "gameSettings";

// ─── Database connection ───

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_PEOPLE)) {
        db.createObjectStore(STORE_PEOPLE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_RESPONSES)) {
        const store = db.createObjectStore(STORE_RESPONSES, {
          keyPath: "questionId",
        });
        store.createIndex("timestamp", "timestamp", { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_SESSIONS)) {
        const store = db.createObjectStore(STORE_SESSIONS, {
          keyPath: "id",
        });
        store.createIndex("startedAt", "startedAt", { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
        db.createObjectStore(STORE_SETTINGS, { keyPath: "userId" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      dbPromise = null;
      reject(request.error);
    };
  });

  return dbPromise;
}

// ─── Generic helpers ───

async function putRecord<T>(storeName: string, record: T): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    store.put(record);
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Silently fail — game runs in memory
  }
}

async function getAllRecords<T>(storeName: string): Promise<T[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const request = store.getAll();
    return new Promise<T[]>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result as T[]);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return [];
  }
}

async function getRecord<T>(
  storeName: string,
  key: string,
): Promise<T | undefined> {
  try {
    const db = await openDB();
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const request = store.get(key);
    return new Promise<T | undefined>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result as T | undefined);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return undefined;
  }
}

// ─── People ───

export async function savePerson(person: Person): Promise<void> {
  await putRecord(STORE_PEOPLE, person);
}

export async function getAllPeople(): Promise<Person[]> {
  return getAllRecords<Person>(STORE_PEOPLE);
}

// ─── Game Responses ───

export async function saveGameResponse(
  response: GameResponse,
): Promise<void> {
  await putRecord(STORE_RESPONSES, response);
}

export async function getRecentGameResponses(
  limit: number = 20,
): Promise<GameResponse[]> {
  try {
    const all = await getAllRecords<GameResponse>(STORE_RESPONSES);
    // Sort by timestamp descending and take the most recent
    return all
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  } catch {
    return [];
  }
}

// ─── Game Sessions ───

export async function saveGameSession(
  session: GameSession,
): Promise<void> {
  await putRecord(STORE_SESSIONS, session);
}

export async function getGameHistory(): Promise<GameSession[]> {
  try {
    const all = await getAllRecords<GameSession>(STORE_SESSIONS);
    return all.sort((a, b) => b.startedAt - a.startedAt);
  } catch {
    return [];
  }
}

// ─── Game Settings ───

const DEFAULT_USER_ID = "default";

export async function saveGameSettings(
  settings: GameSettings,
): Promise<void> {
  await putRecord(STORE_SETTINGS, settings);
}

export async function getGameSettings(): Promise<GameSettings> {
  const stored = await getRecord<GameSettings>(
    STORE_SETTINGS,
    DEFAULT_USER_ID,
  );
  return (
    stored ?? {
      userId: DEFAULT_USER_ID,
      currentDifficulty: "easy",
    }
  );
}

