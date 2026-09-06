import { Star } from "lucide-react";
import { useTranslation } from "react-i18next";

interface GameProgressProps {
  currentQuestion: number;
  totalQuestions: number;
  score: number;
}

/**
 * Horizontal progress bar with question counter and score badge.
 * Matches the existing app's pink gradient style.
 */
export default function GameProgress({
  currentQuestion,
  totalQuestions,
  score,
}: GameProgressProps) {
  const { t } = useTranslation();
  const progress = ((currentQuestion) / totalQuestions) * 100;

  return (
    <div className="space-y-1">
      {/* Score badge row */}
      <div className="flex items-center justify-between">
        <p className="text-base sm:text-lg font-bold text-slate-400">
          {t("games.whoIsThis.questionProgress", { current: currentQuestion, total: totalQuestions })}
        </p>
        <div className="bg-[#FFF0F3] border-2 border-[#FFE0E6] rounded-full px-4 py-1.5 flex items-center gap-1.5">
          <Star size={16} className="text-amber-500" />
          <span className="font-extrabold text-lg text-[#1E2445]">
            {score}/{totalQuestions}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#FF6584] to-[#FF8FA3] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

