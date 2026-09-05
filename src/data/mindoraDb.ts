// ─── Shared IndexedDB connection for locally persisted Mindora data ───
//
// One database for the whole app. The name is historical — it was introduced
// with the "Who Is This?" game — but the `people` store is now caregiver-owned
// data shared by every activity, so the connection and the low-level helpers
// live here rather than inside a single game folder.
//
// These helpers reject when storage is unavailable (private browsing, quota,
// blocked upgrades). Callers decide whether that is fatal; the game and the
// people repository both fall back to in-memory data instead of breaking.

const DB_NAME = "mindora-who-is-this";
const DB_VERSION = 1;

/** Caregiver-managed people, shared across activities. Keyed by `id`. */
export const STORE_PEOPLE = "people";
/** One record per answered question. Keyed by `questionId`. */
export const STORE_RESPONSES = "gameResponses";
/** One record per completed game session. Keyed by `id`. */
export const STORE_SESSIONS = "gameSessions";
/** Per-user game settings. Keyed by `userId`. */
export const STORE_SETTINGS = "gameSettings";

let dbPromise: Promise<IDBDatabase> | null = null;

export function openMindoraDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not available."));
      return;
    }

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
        const store = db.createObjectStore(STORE_SESSIONS, { keyPath: "id" });
        store.createIndex("startedAt", "startedAt", { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
        db.createObjectStore(STORE_SETTINGS, { keyPath: "userId" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      dbPromise = null;
      reject(request.error ?? new Error("Could not open the local database."));
    };
  });

  return dbPromise;
}

export async function putRecord<T>(
  storeName: string,
  record: T,
): Promise<void> {
  const db = await openMindoraDb();
  const tx = db.transaction(storeName, "readwrite");
  tx.objectStore(storeName).put(record);
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

/** Writes several records in one transaction, so a batch is all-or-nothing. */
export async function putRecords<T>(
  storeName: string,
  records: readonly T[],
): Promise<void> {
  if (records.length === 0) return;
  const db = await openMindoraDb();
  const tx = db.transaction(storeName, "readwrite");
  const store = tx.objectStore(storeName);
  for (const record of records) store.put(record);
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export async function getAllRecords<T>(storeName: string): Promise<T[]> {
  const db = await openMindoraDb();
  const tx = db.transaction(storeName, "readonly");
  const request = tx.objectStore(storeName).getAll();
  return new Promise<T[]>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = () => reject(request.error);
  });
}

export async function getRecord<T>(
  storeName: string,
  key: string,
): Promise<T | undefined> {
  const db = await openMindoraDb();
  const tx = db.transaction(storeName, "readonly");
  const request = tx.objectStore(storeName).get(key);
  return new Promise<T | undefined>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result as T | undefined);
    request.onerror = () => reject(request.error);
  });
}
