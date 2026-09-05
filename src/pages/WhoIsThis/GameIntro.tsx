import { Users } from "lucide-react";
import type { Difficulty } from "./types";
import { GAME_LABELS, difficultyLabel } from "./gameLabels";

interface GameIntroProps {
  difficulty: Difficulty;
  onStart: () => void;
}

/**
 * Welcome / instruction screen shown before the game begins.
 * Simple, calm, and encouraging — designed for elderly users.
 */
export default function GameIntro({ difficulty, onStart }: GameIntroProps) {
  return (
    <div className="flex flex-col items-center text-center py-6 sm:py-10 space-y-6">
      {/* Icon */}
      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#FFF0F3] border-4 border-[#FFE0E6] flex items-center justify-center shadow-lg">
        <Users size={48} className="text-[#FF6584]" />
      </div>

      {/* Title */}
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1E2445]">
          {GAME_LABELS.gameTitle}
        </h1>
        <p className="text-xl sm:text-2xl font-bold text-slate-500">
          {GAME_LABELS.welcomeTitle}
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl px-5 py-4 max-w-md">
        <p className="text-lg sm:text-xl font-bold text-amber-800 leading-relaxed">
          💡 {GAME_LABELS.welcomeMessage}
        </p>
      </div>

      {/* Current difficulty */}
      <div className="bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-2.5">
        <p className="text-base font-bold text-slate-500">
          {GAME_LABELS.currentDifficulty}:{" "}
          <span className="text-[#1E2445] font-extrabold">
            {difficultyLabel(difficulty)}
          </span>
        </p>
      </div>

      {/* Start button */}
      <button
        onClick={onStart}
        className="px-10 py-4 bg-[#FF6584] text-white font-extrabold text-xl rounded-2xl hover:bg-[#e8506e] transition-all cursor-pointer shadow-lg min-h-[56px] active:scale-[0.97]"
      >
        {GAME_LABELS.startButton}
      </button>
    </div>
  );
}

