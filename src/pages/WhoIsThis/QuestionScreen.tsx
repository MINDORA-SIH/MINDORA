import { PersonPhoto } from "@/components/PersonPhoto";
import { GAME_LABELS } from "./gameLabels";
import NameOption from "./NameOption";
import type { GameQuestion, Person } from "./types";

interface QuestionScreenProps {
  question: GameQuestion;
  /** The person in the photo. Their name is one of `question.options`. */
  personInPhoto: Person;
  selectedPersonId: string | null;
  isRevealed: boolean;
  onSelectPerson: (personId: string) => void;
}

/**
 * One round: a single large photo above four names.
 *
 * The photo is the question and the names are the answers — image recognition
 * first, name identification second. Nothing on this screen mentions the
 * relationship; that arrives with the feedback, as reinforcement.
 */
export default function QuestionScreen({
  question,
  personInPhoto,
  selectedPersonId,
  isRevealed,
  onSelectPerson,
}: QuestionScreenProps) {
  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="space-y-1 text-center">
        <h2 className="text-2xl font-extrabold text-[#1E2445] sm:text-3xl">
          {GAME_LABELS.questionText}
        </h2>
        <p className="text-lg font-bold text-slate-500 sm:text-xl">
          {GAME_LABELS.questionSubtext}
        </p>
      </div>

      {/* The photo. Alt text stays neutral so it cannot give the answer away. */}
      <div className="flex justify-center">
        <PersonPhoto
          person={personInPhoto}
          alt={GAME_LABELS.questionPhotoAlt}
          className="h-56 w-56 rounded-3xl border-4 border-white shadow-lg sm:h-64 sm:w-64"
          glyphClassName="text-7xl"
        />
      </div>

      {/* Exactly four names, one of them correct. */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        {question.options.map((person) => (
          <NameOption
            key={person.id}
            person={person}
            isSelected={selectedPersonId === person.id}
            isCorrectAnswer={person.id === question.correctPersonId}
            isRevealed={isRevealed}
            onSelect={onSelectPerson}
          />
        ))}
      </div>
    </div>
  );
}
