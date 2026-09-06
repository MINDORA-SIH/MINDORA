import { Users } from "lucide-react";
import type { Difficulty } from "./types";
import { useDifficultyLabel, useGameLabels } from "./gameLabels";

interface GameIntroProps {
  difficulty: Difficulty;
  onStart: () => void;
}

export default function GameIntro({ difficulty, onStart }: GameIntroProps) {
  const labels = useGameLabels();
  const difficultyLabel = useDifficultyLabel();

  return (
    <div className="flex flex-col items-center space-y-6 py-6 text-center sm:py-10">
      <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-[#FFE0E6] bg-[#FFF0F3] shadow-lg sm:h-28 sm:w-28">
        <Users size={48} className="text-[#FF6584]" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-[#1E2445] sm:text-4xl">{labels.gameTitle}</h1>
        <p className="text-xl font-bold text-slate-500 sm:text-2xl">{labels.welcomeTitle}</p>
      </div>
      <div className="max-w-md rounded-2xl border-2 border-amber-200 bg-amber-50 px-5 py-4">
        <p className="text-lg font-bold leading-relaxed text-amber-800 sm:text-xl">💡 {labels.welcomeMessage}</p>
      </div>
      <div className="rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-2.5">
        <p className="text-base font-bold text-slate-500">
          {labels.currentDifficulty}: <span className="font-extrabold text-[#1E2445]">{difficultyLabel(difficulty)}</span>
        </p>
      </div>
      <button onClick={onStart} className="min-h-[56px] cursor-pointer rounded-2xl bg-[#FF6584] px-10 py-4 text-xl font-extrabold text-white shadow-lg transition-all hover:bg-[#e8506e] active:scale-[0.97]">
        {labels.startButton}
      </button>
    </div>
  );
}
