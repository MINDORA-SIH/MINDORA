// ─── Starter people for a fresh install ───
//
// Only used when the people store is empty, so caregiver-managed records are
// never overwritten. Photos are bundled image assets: they are imported as
// modules so Vite resolves them against the deployed base URL and they keep
// working offline.

import jaskaranPhoto from "@/assets/people/jaskaran.jpg";
import ramneetPhoto from "@/assets/people/ramneet.jpg";
import tanveerPhoto from "@/assets/people/tanveer.png";
import rishankPhoto from "@/assets/people/rishank.jpg";
import yugPhoto from "@/assets/people/yug.png";
import type { Person, PersonDraft } from "./peopleTypes";

interface SeedPerson extends PersonDraft {
  /** Fixed so responses recorded against a seed person survive a re-seed. */
  id: string;
  emoji: string;
  color: string;
}

const SEED_PEOPLE: readonly SeedPerson[] = [
  {
    id: "person-seed-jaskaran",
    name: "Jaskaran",
    relationship: "Friend",
    photo: jaskaranPhoto,
    emoji: "👨",
    color: "#3B82C4",
  },
  {
    id: "person-seed-ramneet",
    name: "Ramneet",
    relationship: "Friend",
    photo: ramneetPhoto,
    emoji: "👩",
    color: "#D2557E",
  },
  {
    id: "person-seed-tanveer",
    name: "Tanveer",
    relationship: "Friend",
    photo: tanveerPhoto,
    emoji: "🧑",
    color: "#3E9A6B",
  },
  {
    id: "person-seed-rishank",
    name: "Rishank",
    relationship: "Friend",
    photo: rishankPhoto,
    emoji: "👨",
    color: "#6C5CC4",
  },
  {
    id: "person-seed-yug",
    name: "Yug",
    relationship: "Friend",
    photo: yugPhoto,
    emoji: "👦",
    color: "#C98A2E",
  },
];

/**
 * Full person records for the starter set, stamped at seed time.
 *
 * Timestamps are spaced one millisecond apart so the list keeps the order above
 * once the repository sorts by `createdAt`.
 */
export function buildSeedPeople(): Person[] {
  const seededAt = Date.now();
  return SEED_PEOPLE.map((seed, index) => {
    const timestamp = new Date(seededAt + index).toISOString();
    return {
      ...seed,
      active: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  });
}
