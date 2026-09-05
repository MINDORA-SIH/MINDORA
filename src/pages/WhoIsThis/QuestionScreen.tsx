import type { Difficulty, GameQuestion } from "./types";
import PersonCard from "./PersonCard";
import { GAME_LABELS } from "./gameLabels";

interface QuestionScreenProps {
  question: GameQuestion;
  difficulty: Difficulty;
  selectedPersonId: string | null;
  isRevealed: boolean;
  isCorrect: boolean | null;
  onSelectPerson: (personId: string) => void;
}

/**
 * Displays the current question with a responsive grid of person cards.
 * Grid adapts to the number of options:
 *   3 → 3 columns (1 on small mobile)
 *   4 → 2×2 grid
 *   5–6 → 2×3 or 3×2 grid
 */
export default function QuestionScreen({
  question,
  difficulty,
  selectedPersonId,
  isRevealed,
  isCorrect,
  onSelectPerson,
}: QuestionScreenProps) {
  const optionCount = question.options.length;

  // Determine visibility rules based on difficulty
  const showName = difficulty !== "hard";
  const showRelationship = difficulty === "easy";

  // Grid layout based on option count
  let gridClasses = "grid gap-3 sm:gap-4";
  if (optionCount <= 3) {
    gridClasses += " grid-cols-1 sm:grid-cols-3";
  } else if (optionCount === 4) {
    gridClasses += " grid-cols-2";
  } else {
    gridClasses += " grid-cols-2 sm:grid-cols-3";
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Question text */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E2445]">
          {GAME_LABELS.questionText}
        </h2>
        <p className="text-lg sm:text-xl font-bold text-slate-500">
          {GAME_LABELS.questionSubtext}
        </p>
      </div>

      {/* Person cards grid */}
      <div className={gridClasses}>
        {question.options.map((person) => (
          <PersonCard
            key={person.id}
            person={person}
            isSelected={selectedPersonId === person.id}
            isCorrect={
              selectedPersonId === person.id ? isCorrect : null
            }
            isRevealed={isRevealed}
            showName={showName || isRevealed}
            showRelationship={showRelationship || isRevealed}
            disabled={isRevealed}
            onSelect={onSelectPerson}
          />
        ))}
      </div>
    </div>
  );
}

