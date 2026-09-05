// ─── Session storage for the "Who Is This?" game ───
//
// Responses, sessions and settings live in the shared Mindora database
// (`@/data/mindoraDb`) — there is only ever one database. Every call is wrapped
// so a storage failure (private browsing, quota, blocked upgrade) degrades the
// game to memory-only instead of breaking it.
//
// People are *not* read or written here: they are caregiver-owned records and
// `@/data/peopleRepository` is their single read/write path.

import {
  getAllRecords,
  getRecord,
  putRecord,
  STORE_RESPONSES,
  STORE_SESSIONS,
  STORE_SETTINGS,
} from "@/data/mindoraDb";
import type { GameResponse, GameSession, GameSettings } from "./types";

async function put<T>(storeName: string, record: T): Promise<void> {
  try {
    await putRecord(storeName, record);
  } catch {
    // Silently fail — the session continues in memory.
  }
}

async function getAll<T>(storeName: string): Promise<T[]> {
  try {
    return await getAllRecords<T>(storeName);
  } catch {
    return [];
  }
}

// ─── Game responses ───
//
// Keyed by question id and holding person *ids*, so renaming someone in Manage
// Data leaves past answers pointing at the same person.

export async function saveGameResponse(response: GameResponse): Promise<void> {
  await put(STORE_RESPONSES, response);
}

export async function getRecentGameResponses(limit: number = 20): Promise<GameResponse[]> {
  const all = await getAll<GameResponse>(STORE_RESPONSES);
  return all.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
}

// ─── Game sessions ───

export async function saveGameSession(session: GameSession): Promise<void> {
  await put(STORE_SESSIONS, session);
}

export async function getGameHistory(): Promise<GameSession[]> {
  const all = await getAll<GameSession>(STORE_SESSIONS);
  return all.sort((a, b) => b.startedAt - a.startedAt);
}

// ─── Game settings ───

const DEFAULT_USER_ID = "default";

export async function saveGameSettings(settings: GameSettings): Promise<void> {
  await put(STORE_SETTINGS, settings);
}

export async function getGameSettings(): Promise<GameSettings> {
  try {
    const stored = await getRecord<GameSettings>(STORE_SETTINGS, DEFAULT_USER_ID);
    if (stored) return stored;
  } catch {
    // Fall through to the defaults below.
  }
  return { userId: DEFAULT_USER_ID, currentDifficulty: "easy" };
}
