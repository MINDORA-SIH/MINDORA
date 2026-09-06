import { clsx } from "clsx"
import { PersonPhoto } from "@/components/PersonPhoto"
import { relationshipLabel } from "@/data/peopleTypes"
import { GAME_LABELS } from "./gameLabels"
import type { Person } from "./types"

interface AnswerFeedbackProps {
  correctPerson: Person
  isCorrect: boolean
  onContinue: () => void
}

/**
 * Feedback after an answer, and the moment the relationship does its work.
 *
 * Right or wrong, the patient is told who the person is and how they are
 * related — "This is Rajesh Kumar, your son." — with the sentence generated
 * from the stored Person, never hardcoded. Wrong answers are met with
 * "Not quite." rather than "Wrong".
 */
export default function AnswerFeedback({
  correctPerson,
  isCorrect,
  onContinue,
}: AnswerFeedbackProps) {
  const relationship = relationshipLabel(correctPerson)

  return (
    <div
      className={clsx(
        "space-y-4 rounded-3xl border-2 p-6 text-center sm:p-8",
        isCorrect
          ? "border-emerald-200 bg-emerald-50"
          : "border-amber-200 bg-amber-50",
      )}
    >
      <h2
        className={clsx(
          "text-2xl font-extrabold sm:text-3xl",
          isCorrect ? "text-emerald-700" : "text-amber-800",
        )}
      >
        {isCorrect
          ? `✓ ${GAME_LABELS.correctTitle}`
          : GAME_LABELS.incorrectTitle}
      </h2>

      <div className="flex justify-center">
        <PersonPhoto
          person={correctPerson}
          alt={GAME_LABELS.personPhotoAlt(correctPerson.name)}
          className="h-28 w-28 rounded-full border-4 border-white shadow-lg sm:h-32 sm:w-32"
          glyphClassName="text-5xl"
        />
      </div>

      {/* One sentence: the name carries it, the relationship supports it. */}
      <p className="text-xl font-extrabold leading-snug text-[#1E2445] sm:text-2xl">
        {GAME_LABELS.personIdentityLead(correctPerson.name)}
        {relationship === null ? (
          "."
        ) : (
          <span className="font-bold text-slate-500">
            {GAME_LABELS.personIdentityClause(relationship)}
          </span>
        )}
      </p>

      <button
        type="button"
        onClick={onContinue}
        className="mt-4 min-h-[52px] cursor-pointer rounded-2xl bg-[#FF6584] px-8 py-3.5 text-lg font-extrabold text-white shadow-md transition-all hover:bg-[#e8506e] active:scale-[0.97]"
      >
        {GAME_LABELS.continueButton}
      </button>
    </div>
  )
}
