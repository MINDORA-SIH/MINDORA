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
const DB_VERSION = 4;
const STORE_CRYPTO_KEYS = "cryptoKeys";
const DEVICE_KEY_ID = "mindora-device-aes-256";

/** Caregiver-managed people, shared across activities. Keyed by `id`. */
export const STORE_PEOPLE = "people";
/** One record per answered question. Keyed by `questionId`. */
export const STORE_RESPONSES = "gameResponses";
/** One record per completed game session. Keyed by `id`. */
export const STORE_SESSIONS = "gameSessions";
/** Per-user game settings. Keyed by `userId`. */
export const STORE_SETTINGS = "gameSettings";
/** Caregiver-created routines, keyed by stable routine id. */
export const STORE_ROUTINES = "routines";
/** Completed Daily Routine attempts, keyed by stable session id. */
export const STORE_ROUTINE_SESSIONS = "routineGameSessions";
/** Cached machine translations for dynamic, caregiver-entered content. */
export const STORE_TRANSLATIONS = "i18nCache";

let dbPromise: Promise<IDBDatabase> | null = null;
let deviceKeyPromise: Promise<CryptoKey> | null = null;

interface EncryptedRecord {
  __mindoraEncrypted: true;
  encryptionVersion: 1;
  iv: string;
  ciphertext: string;
  id?: string;
  questionId?: string;
  userId?: string;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  for (const byte of new Uint8Array(buffer)) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToArrayBuffer(value: string): ArrayBuffer {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes.buffer;
}

function requestValue<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed."));
  });
}

function recordIdentifier(record: Record<string, unknown>): ["id" | "questionId" | "userId", string] {
  for (const field of ["id", "questionId", "userId"] as const) {
    if (typeof record[field] === "string" && record[field]) return [field, record[field]];
  }
  throw new Error("Sensitive records must have a stable string identifier.");
}

async function getDeviceKey(db: IDBDatabase): Promise<CryptoKey> {
  if (!deviceKeyPromise) {
    deviceKeyPromise = (async () => {
      const readTx = db.transaction(STORE_CRYPTO_KEYS, "readonly");
      const existing = await requestValue(readTx.objectStore(STORE_CRYPTO_KEYS).get(DEVICE_KEY_ID)) as { id: string; key: CryptoKey } | undefined;
      if (existing?.key) return existing.key;

      // A non-extractable, origin-bound AES-256 key. IndexedDB can structured-clone
      // CryptoKeys without exposing their raw bytes to application JavaScript.
      const key = await crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"],
      );
      const writeTx = db.transaction(STORE_CRYPTO_KEYS, "readwrite");
      writeTx.objectStore(STORE_CRYPTO_KEYS).put({ id: DEVICE_KEY_ID, key });
      await new Promise<void>((resolve, reject) => {
        writeTx.oncomplete = () => resolve();
        writeTx.onerror = () => reject(writeTx.error ?? new Error("Could not store encryption key."));
        writeTx.onabort = () => reject(writeTx.error ?? new Error("Could not store encryption key."));
      });
      return key;
    })().catch((error) => {
      deviceKeyPromise = null;
      throw error;
    });
  }
  return deviceKeyPromise;
}

async function encryptRecord(storeName: string, record: Record<string, unknown>, key: CryptoKey): Promise<EncryptedRecord> {
  const [identifierField, identifier] = recordIdentifier(record);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const additionalData = new TextEncoder().encode(`${storeName}:${identifier}`);
  const plaintext = new TextEncoder().encode(JSON.stringify(record));
  try {
    const ciphertext = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv, additionalData },
      key,
      plaintext,
    );
    return {
      [identifierField]: identifier,
      __mindoraEncrypted: true,
      encryptionVersion: 1,
      iv: arrayBufferToBase64(iv.buffer),
      ciphertext: arrayBufferToBase64(ciphertext),
    };
  } finally {
    plaintext.fill(0);
  }
}

async function decryptRecord<T>(storeName: string, record: T, key: CryptoKey): Promise<T> {
  const encrypted = record as EncryptedRecord;
  if (!encrypted.__mindoraEncrypted) return record;

  const [, identifier] = recordIdentifier(encrypted as unknown as Record<string, unknown>);
  const plaintext = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: new Uint8Array(base64ToArrayBuffer(encrypted.iv)),
      additionalData: new TextEncoder().encode(`${storeName}:${identifier}`),
    },
    key,
    base64ToArrayBuffer(encrypted.ciphertext),
  );
  try {
    return JSON.parse(new TextDecoder().decode(plaintext)) as T;
  } finally {
    new Uint8Array(plaintext).fill(0);
  }
}

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
      if (!db.objectStoreNames.contains(STORE_ROUTINES)) {
        const store = db.createObjectStore(STORE_ROUTINES, { keyPath: "id" });
        store.createIndex("patientId", "patientId", { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_ROUTINE_SESSIONS)) {
        const store = db.createObjectStore(STORE_ROUTINE_SESSIONS, { keyPath: "id" });
        store.createIndex("patientId", "patientId", { unique: false });
        store.createIndex("routineId", "routineId", { unique: false });
        store.createIndex("startedAt", "startedAt", { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_TRANSLATIONS)) {
        const store = db.createObjectStore(STORE_TRANSLATIONS, { keyPath: "id" });
        store.createIndex("lang", "lang", { unique: false });
        store.createIndex("cachedAt", "cachedAt", { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_CRYPTO_KEYS)) {
        db.createObjectStore(STORE_CRYPTO_KEYS, { keyPath: "id" });
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
  const key = await getDeviceKey(db);
  const encrypted = await encryptRecord(storeName, record as Record<string, unknown>, key);
  const tx = db.transaction(storeName, "readwrite");
  tx.objectStore(storeName).put(encrypted);
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
  const key = await getDeviceKey(db);
  const encrypted = await Promise.all(records.map((record) => encryptRecord(storeName, record as Record<string, unknown>, key)));
  const tx = db.transaction(storeName, "readwrite");
  const store = tx.objectStore(storeName);
  for (const record of encrypted) store.put(record);
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export async function getAllRecords<T>(storeName: string): Promise<T[]> {
  const db = await openMindoraDb();
  const key = await getDeviceKey(db);
  const tx = db.transaction(storeName, "readonly");
  const request = tx.objectStore(storeName).getAll();
  const records = await requestValue(request);
  const legacyRecords = (records as T[]).filter(
    (record) => !(record as unknown as EncryptedRecord).__mindoraEncrypted,
  );
  // Upgrade existing plaintext records after a successful read. IDs remain
  // outside the envelope only because IndexedDB needs them as primary keys.
  if (legacyRecords.length > 0) {
    void putRecords(storeName, legacyRecords).catch(() => undefined);
  }
  return Promise.all((records as T[]).map((record) => decryptRecord(storeName, record, key)));
}

export async function getRecord<T>(
  storeName: string,
  recordKey: string,
): Promise<T | undefined> {
  const db = await openMindoraDb();
  const key = await getDeviceKey(db);
  const tx = db.transaction(storeName, "readonly");
  const request = tx.objectStore(storeName).get(recordKey);
  const record = await requestValue(request);
  if (record !== undefined && !(record as EncryptedRecord).__mindoraEncrypted) {
    void putRecord(storeName, record).catch(() => undefined);
  }
  return record === undefined ? undefined : decryptRecord(storeName, record as T, key);
}
