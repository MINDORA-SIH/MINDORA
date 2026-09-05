// ─── Mock family member data for development / demo ───
import type { Person } from "./types";

/**
 * Each person has an `emoji` and `color` used as avatar placeholders when
 * the photo path doesn't resolve to an actual image. This prevents broken
 * image states and keeps the UI polished even without real photographs.
 */
export const MOCK_PEOPLE: Person[] = [
  {
    id: "person-1",
    name: "Ananya",
    relationship: "Daughter",
    photo: "/images/people/ananya.jpg",
    description: "Your daughter who lives in Bangalore",
    emoji: "👩",
    color: "#FF6584",
  },
  {
    id: "person-2",
    name: "Rahul",
    relationship: "Son",
    photo: "/images/people/rahul.jpg",
    description: "Your son who visits every weekend",
    emoji: "👨",
    color: "#4A90D9",
  },
  {
    id: "person-3",
    name: "Meera",
    relationship: "Sister",
    photo: "/images/people/meera.jpg",
    description: "Your sister who lives nearby",
    emoji: "👩‍🦳",
    color: "#9B59B6",
  },
  {
    id: "person-4",
    name: "Priya",
    relationship: "Granddaughter",
    photo: "/images/people/priya.jpg",
    description: "Your granddaughter who loves drawing",
    emoji: "👧",
    color: "#E67E22",
  },
  {
    id: "person-5",
    name: "Arjun",
    relationship: "Grandson",
    photo: "/images/people/arjun.jpg",
    description: "Your grandson who loves cricket",
    emoji: "👦",
    color: "#27AE60",
  },
  {
    id: "person-6",
    name: "Sunita",
    relationship: "Friend",
    photo: "/images/people/sunita.jpg",
    description: "Your childhood friend",
    emoji: "👩‍🦱",
    color: "#E74C3C",
  },
  {
    id: "person-7",
    name: "Vikram",
    relationship: "Brother",
    photo: "/images/people/vikram.jpg",
    description: "Your elder brother",
    emoji: "👴",
    color: "#2980B9",
  },
  {
    id: "person-8",
    name: "Kavita",
    relationship: "Niece",
    photo: "/images/people/kavita.jpg",
    description: "Your niece who calls you every morning",
    emoji: "👩‍🦰",
    color: "#16A085",
  },
];

/** Minimum number of people required to start a game */
export const MIN_PEOPLE_REQUIRED = 2;

/** Questions per game session */
export const QUESTIONS_PER_SESSION = 10;

