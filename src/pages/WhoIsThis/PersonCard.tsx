import { useState } from "react";
import type { Person } from "./types";

interface PersonCardProps {
  person: Person;
  isSelected: boolean;
  isCorrect: boolean | null;
  isRevealed: boolean;
  showName: boolean;
  showRelationship: boolean;
  disabled: boolean;
  onSelect: (personId: string) => void;
}

/**
 * Large tappable card displaying a person's photo (or avatar fallback),
 * name, and relationship. Designed for elderly users with generous touch
 * targets and clear visual states.
 */
export default function PersonCard({
  person,
  isSelected,
  isCorrect,
  isRevealed,
  showName,
  showRelationship,
  disabled,
  onSelect,
}: PersonCardProps) {
  const [imgError, setImgError] = useState(false);

  const isCorrectAnswer = isRevealed && isCorrect === true && isSelected;
  const isWrongAnswer = isRevealed && isCorrect === false && isSelected;
  const isRevealedCorrect = isRevealed && !isSelected && person.id !== "";

  // Card border/bg styles based on state
  let cardStyle =
    "border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300";
  if (isCorrectAnswer) {
    cardStyle = "border-emerald-400 bg-emerald-50";
  } else if (isWrongAnswer) {
    cardStyle = "border-amber-400 bg-amber-50";
  } else if (isSelected && !isRevealed) {
    cardStyle = "border-[#FF6584] bg-[#FFF0F3] ring-2 ring-[#FF6584]/30";
  } else if (disabled && isRevealed) {
    cardStyle = "border-slate-200 bg-slate-50 opacity-60";
  }

  // Avatar fallback color
  const avatarBg = person.color ?? "#FF6584";

  return (
    <button
      type="button"
      onClick={() => onSelect(person.id)}
      disabled={disabled}
      aria-label={`Select ${showName ? person.name : "person"}`}
      className={`
        flex flex-col items-center gap-2 p-4 sm:p-5
        rounded-2xl border-2 transition-all duration-200
        cursor-pointer min-h-[140px] w-full
        active:scale-[0.97]
        disabled:cursor-default disabled:active:scale-100
        ${cardStyle}
      `}
    >
      {/* Photo / Avatar */}
      <div
        className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full border-4 border-white shadow-md flex items-center justify-center overflow-hidden flex-shrink-0"
        style={{ backgroundColor: avatarBg + "22" }}
      >
        {!imgError && person.photo ? (
          <img
            src={person.photo}
            alt={showName ? person.name : "Person"}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="text-4xl sm:text-5xl select-none" aria-hidden="true">
            {person.emoji ?? person.name.charAt(0)}
          </span>
        )}
      </div>

      {/* Name */}
      {showName && (
        <span className="text-lg sm:text-xl font-extrabold text-[#1E2445] leading-tight text-center">
          {person.name}
        </span>
      )}

      {/* Relationship */}
      {showRelationship && (
        <span className="text-base font-bold text-slate-500 leading-tight text-center">
          {person.relationship}
        </span>
      )}

      {/* Correct / Incorrect indicator */}
      {isCorrectAnswer && (
        <span className="text-emerald-600 font-extrabold text-base flex items-center gap-1">
          ✓ Correct
        </span>
      )}
      {isWrongAnswer && (
        <span className="text-amber-700 font-extrabold text-base flex items-center gap-1">
          Not quite
        </span>
      )}
    </button>
  );
}

