import { clsx } from "clsx";
import { PersonPhoto } from "@/components/PersonPhoto";
import { relationshipLabel } from "@/data/peopleTypes";
import { useGameLabels } from "./gameLabels";
import type { Person } from "./types";

interface AnswerFeedbackProps {
  correctPerson: Person;
  isCorrect: boolean;
  onContinue: () => void;
}

export default function AnswerFeedback({ correctPerson, isCorrect, onContinue }: AnswerFeedbackProps) {
  const relationship = relationshipLabel(correctPerson);
  const labels = useGameLabels();

  return (
    <div className={clsx("space-y-4 rounded-3xl border-2 p-6 text-center sm:p-8", isCorrect ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50")}>
      <h2 className={clsx("text-2xl font-extrabold sm:text-3xl", isCorrect ? "text-emerald-700" : "text-amber-800")}>
        {isCorrect ? `✓ ${labels.correctTitle}` : labels.incorrectTitle}
      </h2>
      <div className="flex justify-center">
        <PersonPhoto person={correctPerson} alt={labels.personPhotoAlt(correctPerson.name)} className="h-28 w-28 rounded-full border-4 border-white shadow-lg sm:h-32 sm:w-32" glyphClassName="text-5xl" />
      </div>
      <p className="text-xl font-extrabold leading-snug text-[#1E2445] sm:text-2xl">
        {labels.personIdentityLead(correctPerson.name)}
        {relationship === null ? "." : <span className="font-bold text-slate-500">{labels.personIdentityClause(relationship)}</span>}
      </p>
      <button type="button" onClick={onContinue} className="mt-4 min-h-[52px] cursor-pointer rounded-2xl bg-[#FF6584] px-8 py-3.5 text-lg font-extrabold text-white shadow-md transition-all hover:bg-[#e8506e] active:scale-[0.97]">
        {labels.continueButton}
      </button>
    </div>
  );
}
