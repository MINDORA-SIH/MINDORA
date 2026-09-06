// ─── Starter people for a fresh install ───
//
// Only used when the people store is empty, so caregiver-managed records are
// never overwritten. Photos are bundled SVG placeholders: they are imported as
// modules so Vite resolves them against the deployed base URL and they keep
// working offline.

import anilPhoto from "@/assets/people/anil.svg"
import hariPhoto from "@/assets/people/hari.svg"
import meenaPhoto from "@/assets/people/meena.svg"
import rajeshPhoto from "@/assets/people/rajesh.svg"
import sunitaPhoto from "@/assets/people/sunita.svg"
import type { Person, PersonDraft } from "./peopleTypes"

interface SeedPerson
  extends PersonDraft {
  /** Fixed so responses recorded against a seed person survive a re-seed. */
  id: string
  emoji: string
  color: string
}

const SEED_PEOPLE: readonly SeedPerson[] = [
  {
    id: "person-seed-rajesh",
    name: "Rajesh Kumar",
    relationship: "Son",
    photo: rajeshPhoto,
    emoji: "👨",
    color: "#3B82C4",
  },
  {
    id: "person-seed-sunita",
    name: "Sunita Devi",
    relationship: "Sister",
    photo: sunitaPhoto,
    emoji: "👩",
    color: "#D2557E",
  },
  {
    id: "person-seed-anil",
    name: "Anil Das",
    relationship: "Nephew",
    photo: anilPhoto,
    emoji: "🧑",
    color: "#3E9A6B",
  },
  {
    id: "person-seed-meena",
    name: "Meena Sharma",
    relationship: "Daughter",
    photo: meenaPhoto,
    emoji: "👩",
    color: "#6C5CC4",
  },
  {
    id: "person-seed-hari",
    name: "Hari Singh",
    relationship: "Brother",
    photo: hariPhoto,
    emoji: "👴",
    color: "#C98A2E",
  },
]

/**
 * Full person records for the starter set, stamped at seed time.
 *
 * Timestamps are spaced one millisecond apart so the list keeps the order above
 * once the repository sorts by `createdAt`.
 */
export function buildSeedPeople(): Person[] {
  const seededAt = Date.now()
  return SEED_PEOPLE.map((seed, index) => {
    const timestamp = new Date(seededAt + index).toISOString()
    return {
      ...seed,
      active: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    }
  })
}
