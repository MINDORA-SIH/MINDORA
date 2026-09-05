/**
 * Shared person model. Owned by the caregiver, consumed by every activity that
 * shows familiar faces — today that is "Who Is This?", tomorrow it can be any
 * other people-based game.
 *
 * `relationship` is structured data, stored separately from `name` and never
 * folded into it. Screens may render the two together ("Rajesh Kumar, your
 * son"), but nothing parses a display string to recover the relationship.
 */

/**
 * The relationships a caregiver can choose from. `Other` is the escape hatch:
 * it pairs with `Person.customRelationship` rather than widening this union
 * with arbitrary caregiver input.
 */
export const RELATIONSHIPS = [
  "Son",
  "Daughter",
  "Spouse",
  "Brother",
  "Sister",
  "Grandson",
  "Granddaughter",
  "Nephew",
  "Niece",
  "Friend",
  "Caregiver",
  "Other",
] as const;

export type Relationship = (typeof RELATIONSHIPS)[number];

/** The single option whose label the caregiver types in themselves. */
export const CUSTOM_RELATIONSHIP = "Other" satisfies Relationship;

export interface Person {
  id: string;
  name: string;
  relationship: Relationship;
  /** Caregiver-entered label. Only meaningful when `relationship` is "Other". */
  customRelationship?: string;
  /** Image source — a bundled placeholder URL or an uploaded data URL. */
  photo: string;
  /**
   * Soft-delete flag. Inactive people are excluded from newly generated
   * questions but stay attached to the responses that already reference them.
   */
  active: boolean;
  /** ISO 8601 timestamp. */
  createdAt: string;
  /** ISO 8601 timestamp. */
  updatedAt: string;
  /** Fallback avatar glyph, used only when `photo` fails to load. */
  emoji?: string;
  /** Tint behind the fallback glyph. */
  color?: string;
}

/**
 * The caregiver-editable half of a person. Identity and audit fields (`id`,
 * `createdAt`, `updatedAt`, `active`) are owned by the repository, so editing a
 * person can never change who that record refers to.
 */
export interface PersonDraft {
  name: string;
  relationship: Relationship;
  customRelationship?: string;
  photo: string;
}

type RelationshipFields = Pick<Person, "relationship" | "customRelationship">;

/** Narrows caregiver input or stored strings onto the union. */
export function isRelationship(value: string): value is Relationship {
  return (RELATIONSHIPS as readonly string[]).includes(value);
}

/**
 * The relationship to show or speak.
 *
 * Returns `null` when "Other" was recorded without a custom label, so callers
 * drop the clause entirely instead of reading out "your other".
 */
export function relationshipLabel(person: RelationshipFields): string | null {
  if (person.relationship !== CUSTOM_RELATIONSHIP) return person.relationship;
  const custom = person.customRelationship?.trim();
  return custom && custom.length > 0 ? custom : null;
}

/** Same as {@link relationshipLabel}, but always renderable in a list row. */
export function relationshipText(person: RelationshipFields): string {
  return relationshipLabel(person) ?? CUSTOM_RELATIONSHIP;
}

/** Active people, in caregiver display order. */
export function selectActivePeople(people: readonly Person[]): Person[] {
  return people.filter((person) => person.active);
}
