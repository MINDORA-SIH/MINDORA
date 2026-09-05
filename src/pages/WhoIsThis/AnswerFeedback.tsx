import { useState } from "react";
import type { Person } from "./types";
import { GAME_LABELS } from "./gameLabels";

interface AnswerFeedbackProps {
  correctPerson: Person;
  isCorrect: boolean;
  onContinue: () => void;
}

/**
 * Feedback overlay after an answer is submitted.
 * Shows whether the answer was correct, along with the person's info.
 * Uses gentle language: "Not quite" instead of "Wrong".
 */
export default function AnswerFeedback({
  correctPerson,
  isCorrect,
  onContinue,
}: AnswerFeedbackProps) {
  const [imgError, setImgError] = useState(false);

  const bgColor = isCorrect
    ? "bg-emerald-50 border-emerald-200"
    : "bg-amber-50 border-amber-200";

  const titleColor = isCorrect ? "text-emerald-700" : "text-amber-800";
  const icon = isCorrect ? "✓" : "";

  return (
    <div
      className={`rounded-3xl border-2 p-6 sm:p-8 text-center space-y-4 ${bgColor}`}
    >
      {/* Title */}
      <h2 className={`text-2xl sm:text-3xl font-extrabold ${titleColor}`}>
        {icon} {isCorrect ? GAME_LABELS.correctTitle : GAME_LABELS.incorrectTitle}
      </h2>

      {/* Person photo */}
      <div className="flex justify-center">
        <div
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white shadow-lg flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: (correctPerson.color ?? "#FF6584") + "22" }}
        >
          {!imgError && correctPerson.photo ? (
            <img
              src={correctPerson.photo}
              alt={correctPerson.name}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="text-5xl select-none" aria-hidden="true">
              {correctPerson.emoji ?? correctPerson.name.charAt(0)}
            </span>
          )}
        </div>
      </div>

      {/* Person info */}
      <div>
        <p className="text-xl sm:text-2xl font-extrabold text-[#1E2445]">
          This is {correctPerson.name}.
        </p>
        <p className="text-lg sm:text-xl font-bold text-slate-500 mt-1">
          {correctPerson.description ??
            `Your ${correctPerson.relationship.toLowerCase()}.`}
        </p>
      </div>

      {/* Continue button */}
      <button
        onClick={onContinue}
        className="mt-4 px-8 py-3.5 bg-[#FF6584] text-white font-extrabold text-lg rounded-2xl hover:bg-[#e8506e] transition-all cursor-pointer shadow-md min-h-[52px] active:scale-[0.97]"
      >
        {GAME_LABELS.continueButton}
      </button>
    </div>
  );
}

