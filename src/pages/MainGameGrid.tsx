import {
  Users,
  FileText,
  LayoutGrid,
  Music,
  ListCheck,
  Eye,
} from "lucide-react"
import { useNavigate } from "react-router"
import { useTranslation } from "react-i18next"

export function MainGameGrid() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const games = [
    {
      id: 1,
      title: t("games.whoIsThis.title"),
      label: t("games.whoIsThis.label"),
      description: t("games.whoIsThis.description"),
      icon: (
        <Users className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 text-[#993C1D]" />
      ),
      bg: "bg-[#FAECE7] border-[#993C1D]/20 hover:bg-[#993C1D]/10",
      textColor: "text-[#993C1D]",
      path: "/who-is-this",
    },
    {
      id: 2,
      title: t("games.storyQuiz.title"),
      label: t("games.storyQuiz.label"),
      description: t("games.storyQuiz.description"),
      icon: (
        <FileText className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 text-[#185FA5]" />
      ),
      bg: "bg-[#E6F1FB] border-[#185FA5]/20 hover:bg-[#185FA5]/10",
      textColor: "text-[#185FA5]",
      path: "/story-quiz",
    },
    {
      id: 3,
      title: t("dailyRoutine.title"),
      label: t("games.dailyRoutineGame.label"),
      description: t("games.dailyRoutineGame.description"),
      icon: (
        <ListCheck className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 text-[#0F6E56]" />
      ),
      bg: "bg-[#E1F5EE] border-[#0F6E56]/20 hover:bg-[#0F6E56]/10",
      textColor: "text-[#0F6E56]",
      path: "/daily-routine",
    },
    {
      id: 4,
      title: t("games.wordSoundMemory.title"),
      label: t("games.wordSoundMemory.label"),
      description: t("games.wordSoundMemory.description"),
      icon: (
        <Music className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 text-[#3B6D11]" />
      ),
      bg: "bg-[#EAF3DE] border-[#3B6D11]/20 hover:bg-[#3B6D11]/10",
      textColor: "text-[#3B6D11]",
      path: "/word-sound-memory",
    },
    {
      id: 5,
      title: t("games.patternRecognition.title"),
      label: t("games.patternRecognition.label"),
      description: t("games.patternRecognition.description"),
      icon: (
        <LayoutGrid className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 text-[#854F0B]" />
      ),
      bg: "bg-[#FAEEDA] border-[#854F0B]/20 hover:bg-[#854F0B]/10",
      textColor: "text-[#854F0B]",
      path: "/pattern-recognition",
    },
    {
      id: 6,
      title: t("games.spotTheDifference.title"),
      label: t("games.spotTheDifference.label"),
      description: t("games.spotTheDifference.description"),
      icon: (
        <Eye className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 text-[#534AB7]" />
      ),
      bg: "bg-[#EEEDFE] border-[#534AB7]/20 hover:bg-[#534AB7]/10",
      textColor: "text-[#534AB7]",
      path: "/spot-the-difference",
    },
  ]

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
      {/* Greeting Header Section */}
      <div className="pt-2 text-center w-full">
        <h1
          className="text-[26px] md:text-[28px] font-bold tracking-tight"
          style={{ color: "var(--foreground)" }}
        >
          {t("common.welcome", { name: "Savitri" })}
        </h1>
      </div>

      {/* 2-Column on Mobile, 3-Column on Laptop */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6 pt-1">
        {games.map((game) => (
          <button
            key={game.id}
            onClick={() => game.path && navigate(game.path)}
            className={`flex flex-col items-center justify-center p-5 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border-2 transition-all duration-200 shadow-xs hover:shadow-lg active:scale-95 text-center min-h-[160px] sm:min-h-[180px] md:min-h-[220px] w-full cursor-pointer group ${game.bg}`}
          >
            <div className="w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center shadow-xs mb-3 md:mb-4 transition-transform group-hover:scale-110">
              {game.icon}
            </div>
            <h2
              className={`text-[20px] md:text-[22px] font-semibold leading-tight px-1 ${game.textColor} dark:text-[var(--foreground)]`}
            >
              {game.title}
            </h2>
            <span
              className={`mt-3 rounded-full border border-white/80 bg-white/90 px-3 py-1 text-sm sm:text-base font-extrabold tracking-wide uppercase shadow-sm ${game.textColor} dark:bg-slate-800 dark:text-white`}
            >
              {game.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default MainGameGrid
