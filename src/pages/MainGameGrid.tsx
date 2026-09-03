import { Users, FileText, Palette, LayoutGrid, Music, ListCheck } from "lucide-react";
import { useNavigate } from "react-router";

export function MainGameGrid() {
  const navigate = useNavigate();

  const games = [
    {
      id: 1,
      title: "Who is this?",
      description: "Identify family members & memory photos",
      icon: <Users className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 text-[#993C1D]" />,
      bg: "bg-[#FAECE7] border-[#993C1D]/20 hover:bg-[#993C1D]/10",
      textColor: "text-[#993C1D]",
      path: "/who-is-this",
    },
    {
      id: 2,
      title: "Story Quiz",
      description: "Answer fun questions from stories",
      icon: <FileText className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 text-[#185FA5]" />,
      bg: "bg-[#E6F1FB] border-[#185FA5]/20 hover:bg-[#185FA5]/10",
      textColor: "text-[#185FA5]",
      path: "/story-quiz",
    },
    {
      id: 3,
      title: "Color Sequence",
      description: "Remember and repeat color patterns",
      icon: <Palette className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 text-[#534AB7]" />,
      bg: "bg-[#EEEDFE] border-[#534AB7]/20 hover:bg-[#534AB7]/10",
      textColor: "text-[#534AB7]",
      path: "/color-sequence",
    },
    {
      id: 4,
      title: "Pattern Recognition",
      description: "Match visual patterns & shapes",
      icon: <LayoutGrid className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 text-[#854F0B]" />,
      bg: "bg-[#FAEEDA] border-[#854F0B]/20 hover:bg-[#854F0B]/10",
      textColor: "text-[#854F0B]",
      path: "/pattern-recognition",
    },
    {
      id: 5,
      title: "Word-Sound Memory",
      description: "Listen to melodies and recall words",
      icon: <Music className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 text-[#3B6D11]" />,
      bg: "bg-[#EAF3DE] border-[#3B6D11]/20 hover:bg-[#3B6D11]/10",
      textColor: "text-[#3B6D11]",
      path: "/word-sound-memory",
    },
    {
      id: 6,
      title: "Daily Routine",
      description: "Plan and organize daily schedule",
      icon: <ListCheck className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 text-[#0F6E56]" />,
      bg: "bg-[#E1F5EE] border-[#0F6E56]/20 hover:bg-[#0F6E56]/10",
      textColor: "text-[#0F6E56]",
      path: "/reminders",
    },
  ];

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
      {/* Greeting Header Section */}
      <div className="pt-2 text-center w-full">
        <h1 className="text-[26px] md:text-[28px] font-bold tracking-tight" style={{ color: "var(--foreground)" }}>
          Welcome Savitri
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
            <h2 className={`text-[20px] md:text-[22px] font-semibold leading-tight px-1 ${game.textColor} dark:text-[var(--foreground)]`}>
              {game.title}
            </h2>
          </button>
        ))}
      </div>
    </div>
  );
}

export default MainGameGrid;
