import { Star, Heart, RotateCcw } from "lucide-react"
import { useNavigate } from "react-router"
import type { Difficulty } from "./types"
import { GAME_LABELS, difficultyLabel } from "./gameLabels"

interface SessionSummaryProps {
  score: number
  totalQuestions: number
  accuracy: number
  averageResponseTime: number
  difficulty: Difficulty
  onPlayAgain: () => void
}

/**
 * End-of-session results screen showing score, accuracy, response time,
 * and an encouraging message. Never makes the user feel punished.
 */
export default function SessionSummary({
  score,
  totalQuestions,
  accuracy,
  averageResponseTime,
  difficulty,
  onPlayAgain,
}: SessionSummaryProps) {
  const navigate = useNavigate()
  const percentage = Math.round(accuracy * 100)
  const avgTimeSec = (averageResponseTime / 1000).toFixed(1)

  // Encouraging message based on performance
  const getMessage = () => {
    if (percentage >= 80) return "Wonderful memory!"
    if (percentage >= 50) return "Great effort!"
    return "Good practice! Keep going."
  }

  return (
    <div className="flex flex-col items-center text-center py-6 sm:py-10 space-y-6">
      {/* Icon */}
      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-pink-100 to-rose-200 flex items-center justify-center shadow-lg">
        {percentage >= 80 ? (
          <Star size={48} className="text-amber-500" />
        ) : (
          <Heart size={48} className="text-pink-500" />
        )}
      </div>

      {/* Title */}
      <div className="space-y-2">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1E2445]">
          {GAME_LABELS.summaryTitle}
        </h2>
        <p className="text-xl sm:text-2xl font-bold text-slate-500">
          {GAME_LABELS.summaryMessage}
        </p>
      </div>

      {/* Score circle */}
      <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-full border-[6px] border-pink-200 flex flex-col items-center justify-center bg-white shadow-md">
        <span className="text-4xl sm:text-5xl font-extrabold text-[#FF6584]">
          {score}/{totalQuestions}
        </span>
        <span className="text-base font-bold text-slate-400 uppercase tracking-wide mt-0.5">
          {GAME_LABELS.scoreLabel}
        </span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg">
        {/* Accuracy */}
        <div className="bg-white border-2 border-slate-100 rounded-2xl p-4 shadow-sm">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">
            {GAME_LABELS.accuracyLabel}
          </p>
          <p className="text-2xl font-extrabold text-[#1E2445] mt-1">
            {percentage}%
          </p>
        </div>

        {/* Response time */}
        <div className="bg-white border-2 border-slate-100 rounded-2xl p-4 shadow-sm">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">
            {GAME_LABELS.avgResponseTimeLabel}
          </p>
          <p className="text-2xl font-extrabold text-[#1E2445] mt-1">
            {avgTimeSec}s
          </p>
        </div>

        {/* Difficulty */}
        <div className="bg-white border-2 border-slate-100 rounded-2xl p-4 shadow-sm">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">
            {GAME_LABELS.difficultyLabel}
          </p>
          <p className="text-2xl font-extrabold text-[#1E2445] mt-1">
            {difficultyLabel(difficulty)}
          </p>
        </div>
      </div>

      {/* Encouraging message */}
      <p className="text-lg font-bold text-slate-500 italic">
        {getMessage()} {GAME_LABELS.summaryEncouragement}
      </p>

      {/* Action buttons */}
      <div className="flex gap-3 flex-wrap justify-center">
        <button
          onClick={onPlayAgain}
          className="px-6 py-3 bg-[#FF6584] text-white font-extrabold text-lg rounded-2xl hover:bg-[#e8506e] transition-all cursor-pointer shadow-md flex items-center gap-2 min-h-[52px] active:scale-[0.97]"
        >
          <RotateCcw size={20} />
          {GAME_LABELS.playAgainButton}
        </button>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 bg-slate-100 text-slate-700 font-extrabold text-lg rounded-2xl hover:bg-slate-200 transition-all cursor-pointer shadow-sm min-h-[52px] active:scale-[0.97]"
        >
          {GAME_LABELS.backToGames}
        </button>
      </div>
    </div>
  )
}
