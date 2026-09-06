import { clsx } from "clsx"
import { Check } from "lucide-react"
import type { Person } from "./types"

interface NameOptionProps {
  person: Person
  /** True when this is the name the patient tapped. */
  isSelected: boolean
  /** True when this is the person in the photo. Only acted on once revealed. */
  isCorrectAnswer: boolean
  isRevealed: boolean
  onSelect: (personId: string) => void
}

/**
 * One answer button: a name, nothing else.
 *
 * The photo is the question and the name is the answer, so the relationship is
 * deliberately absent here — it belongs in the feedback that follows. Sized for
 * unsteady hands: full width, generous height, large type.
 */
export default function NameOption({
  person,
  isSelected,
  isCorrectAnswer,
  isRevealed,
  onSelect,
}: NameOptionProps) {
  // After the reveal the correct name is always highlighted, even when the
  // patient picked another one — seeing the right answer is the reinforcement.
  const showCorrect = isRevealed && isCorrectAnswer
  const showWrong = isRevealed && isSelected && !isCorrectAnswer

  return (
    <button
      type="button"
      onClick={() => onSelect(person.id)}
      disabled={isRevealed}
      aria-pressed={isSelected}
      className={clsx(
        "flex min-h-[72px] w-full items-center justify-center gap-2.5 rounded-2xl border-2 px-5 py-4",
        "text-center text-xl font-extrabold leading-tight transition-all duration-200 sm:text-2xl",
        "cursor-pointer active:scale-[0.98] disabled:cursor-default disabled:active:scale-100",
        showCorrect
          ? "border-emerald-400 bg-emerald-50 text-emerald-800"
          : showWrong
            ? "border-amber-400 bg-amber-50 text-amber-800"
            : isSelected
              ? "border-[#FF6584] bg-[#FFF0F3] text-[#1E2445] ring-2 ring-[#FF6584]/30"
              : isRevealed
                ? "border-slate-200 bg-slate-50 text-slate-400"
                : "border-slate-200 bg-slate-50 text-[#1E2445] hover:border-slate-300 hover:bg-white",
      )}
    >
      {showCorrect ? (
        <Check className="h-6 w-6 shrink-0" aria-hidden="true" />
      ) : null}
      {person.name}
    </button>
  )
}
