import { Users, FileText, Hash, LayoutGrid, Music, ListCheck } from "lucide-react";
import { useNavigate } from "react-router";

export function MainGameGrid() {
  const navigate = useNavigate();

  const games = [
    {
      id: 1,
      title: "Who is this?",
      description: "Identify family members & memory photos",
      icon: <Users className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 text-[#FF6584]" />,
      bg: "bg-[#FFF0F3] border-[#FFE0E6] hover:bg-[#FFE4EC]",
      path: "/who-is-this",
    },
    {
      id: 2,
      title: "Story Quiz",
      description: "Answer fun questions from stories",
      icon: <FileText className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 text-[#3B82F6]" />,
      bg: "bg-[#F0F7FF] border-[#E0F0FF] hover:bg-[#E2F0FF]",
      path: "/story-quiz",
    },
    {
      id: 3,
      title: "Number Sequence",
      description: "Simple & engaging counting games",
      icon: <Hash className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 text-[#9333EA]" />,
      bg: "bg-[#F5F0FF] border-[#EBE0FF] hover:bg-[#EBE0FF]",
      path: "/number-sequence",
    },
    {
      id: 4,
      title: "Pattern Recognition",
      description: "Match visual patterns & shapes",
      icon: <LayoutGrid className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 text-[#FF7A00]" />,
      bg: "bg-[#FFF5EE] border-[#FFE5D8] hover:bg-[#FFEADF]",
      path: "/pattern-recognition",
    },
    {
      id: 5,
      title: "Word-Sound Memory",
      description: "Listen to melodies and recall words",
      icon: <Music className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 text-[#10B981]" />,
      bg: "bg-[#F0FDF4] border-[#DCFCE7] hover:bg-[#DCFCE7]",
      path: "/word-sound-memory",
    },
    {
      id: 6,
      title: "Daily Routine",
      description: "Plan and organize daily schedule",
      icon: <ListCheck className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 text-[#7C3AED]" />,
      bg: "bg-[#F3F0FF] border-[#E5E0FF] hover:bg-[#E7E0FF]",
      path: "/reminders",
    },
  ];

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
      {/* Greeting Header Section */}
      <div className="pt-2 text-left">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1E2445] tracking-tight">
          Welcome Savitri
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-slate-500 font-medium mt-1.5 leading-snug max-w-sm sm:max-w-md md:max-w-xl">
          Choose a daily activity to keep your mind active and healthy.
        </p>
        <div className="w-10 h-1.5 bg-[#FF6584] rounded-full mt-3"></div>
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
            <h2 className="text-sm sm:text-base md:text-xl font-extrabold text-[#1E2445] leading-tight px-1">
              {game.title}
            </h2>
            <p className="text-xs md:text-sm text-slate-500 font-medium mt-1 leading-snug hidden md:block px-2">
              {game.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}


