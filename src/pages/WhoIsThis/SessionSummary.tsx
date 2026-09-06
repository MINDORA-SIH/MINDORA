import { Heart, RotateCcw, Star } from "lucide-react";
import { useNavigate } from "react-router";
import type { Difficulty } from "./types";
import { useDifficultyLabel, useGameLabels } from "./gameLabels";

interface SessionSummaryProps {
  score: number;
  totalQuestions: number;
  accuracy: number;
  averageResponseTime: number;
  difficulty: Difficulty;
  onPlayAgain: () => void;
}

export default function SessionSummary({ score, totalQuestions, accuracy, averageResponseTime, difficulty, onPlayAgain }: SessionSummaryProps) {
  const navigate = useNavigate();
  const labels = useGameLabels();
  const difficultyLabel = useDifficultyLabel();
  const percentage = Math.round(accuracy * 100);
  const averageSeconds = (averageResponseTime / 1000).toFixed(1);

  return (
    <div className="flex flex-col items-center space-y-6 py-6 text-center sm:py-10">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-pink-100 to-rose-200 shadow-lg sm:h-28 sm:w-28">
        {percentage >= 80 ? <Star size={48} className="text-amber-500" /> : <Heart size={48} className="text-pink-500" />}
      </div>
      <div className="space-y-2"><h2 className="text-3xl font-extrabold text-[#1E2445] sm:text-4xl">{labels.summaryTitle}</h2><p className="text-xl font-bold text-slate-500 sm:text-2xl">{labels.summaryMessage}</p></div>
      <div className="flex h-36 w-36 flex-col items-center justify-center rounded-full border-[6px] border-pink-200 bg-white shadow-md sm:h-40 sm:w-40"><span className="text-4xl font-extrabold text-[#FF6584] sm:text-5xl">{score}/{totalQuestions}</span><span className="mt-0.5 text-base font-bold uppercase tracking-wide text-slate-400">{labels.scoreLabel}</span></div>
      <div className="grid w-full max-w-lg grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat label={labels.accuracyLabel} value={`${percentage}%`} />
        <Stat label={labels.avgResponseTimeLabel} value={`${averageSeconds} ${labels.secondsUnit}`} />
        <Stat label={labels.difficultyLabel} value={difficultyLabel(difficulty)} />
      </div>
      <p className="text-lg font-bold italic text-slate-500">{labels.summaryEncouragement}</p>
      <div className="flex flex-wrap justify-center gap-3">
        <button onClick={onPlayAgain} className="flex min-h-[52px] cursor-pointer items-center gap-2 rounded-2xl bg-[#FF6584] px-6 py-3 text-lg font-extrabold text-white shadow-md transition-all hover:bg-[#e8506e] active:scale-[0.97]"><RotateCcw size={20} />{labels.playAgainButton}</button>
        <button onClick={() => navigate("/")} className="min-h-[52px] cursor-pointer rounded-2xl bg-slate-100 px-6 py-3 text-lg font-extrabold text-slate-700 shadow-sm transition-all hover:bg-slate-200 active:scale-[0.97]">{labels.backToGames}</button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border-2 border-slate-100 bg-white p-4 shadow-sm"><p className="text-sm font-bold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 text-2xl font-extrabold text-[#1E2445]">{value}</p></div>;
}
