import { useState } from "react";
import { ChevronLeft, Eye, RotateCcw, Star, Trophy } from "lucide-react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

const differences = [
  { id: "sun", label: "Sun", left: "☀️", right: "🌤️" },
  { id: "flower", label: "Flower", left: "🌷", right: "🌻" },
  { id: "bird", label: "Bird", left: "🐦", right: "" },
];

export function SpotTheDifference() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [found, setFound] = useState<string[]>([]);

  const remaining = differences.filter((difference) => !found.includes(difference.id));
  const complete = found.length === differences.length;

  const findDifference = (id: string) => {
    setFound((current) => (current.includes(id) ? current : [...current, id]));
  };

  const restart = () => setFound([]);

  return (
    <div className="space-y-5 md:space-y-6 animate-in fade-in duration-300">
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-[20px] transition-colors cursor-pointer"
      >
        <ChevronLeft size={18} />
        {t("common.backToGames")}
      </button>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#F5F0FF] border-2 border-[#EBE0FF] flex items-center justify-center">
            <Eye size={22} className="text-[#534AB7]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#1E2445] leading-tight">{t("games.spotTheDifference.title")}</h1>
            <p className="text-[18px] sm:text-[20px] text-slate-500 font-bold">{t("games.spotTheDifference.subtitle")}</p>
          </div>
        </div>
        <div className="shrink-0 bg-[#F5F0FF] border-2 border-[#EBE0FF] rounded-full px-3 sm:px-4 py-1.5 flex items-center gap-1.5">
          <Star size={16} className="text-[#534AB7]" />
          <span className="font-extrabold text-[18px] sm:text-[20px] text-[#1E2445]">{found.length}/3</span>
        </div>
      </div>

      <div className="bg-white border-2 border-slate-100 rounded-3xl shadow-md p-5 sm:p-6 md:p-8">
        <div className="text-center mb-5">
          {complete ? (
            <div className="space-y-1 animate-in fade-in duration-200">
              <h2 className="text-xl font-extrabold text-emerald-600">{t("games.spotTheDifference.wonderfulFocus")}</h2>
              <p className="text-slate-500 font-bold">{t("games.spotTheDifference.foundEvery")}</p>
            </div>
          ) : (
            <p className="text-slate-500 font-bold">{t("games.spotTheDifference.instruction")}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {(["left", "right"] as const).map((side) => (
            <section key={side} className="rounded-3xl border-2 border-[#D9D4F5] bg-[#F9F8FF] p-5 min-h-[245px]">
              <h2 className="text-center font-extrabold text-[#534AB7] mb-4">{t("games.spotTheDifference.picture", { letter: side === "left" ? "A" : "B" })}</h2>
              <div className="grid grid-cols-3 gap-3 place-items-center text-4xl sm:text-5xl">
                <span>🏡</span>
                <button onClick={() => findDifference("sun")} className={`rounded-2xl p-2 transition ${found.includes("sun") ? "bg-emerald-100 ring-2 ring-emerald-400" : "hover:bg-white focus-visible:ring-2 focus-visible:ring-[#534AB7]"}`} aria-label={`Find the sun difference in picture ${side === "left" ? "A" : "B"}`}>
                  {side === "left" ? differences[0].left : differences[0].right}
                </button>
                <span>☁️</span>
                <span>🌳</span>
                <button onClick={() => findDifference("flower")} className={`rounded-2xl p-2 transition ${found.includes("flower") ? "bg-emerald-100 ring-2 ring-emerald-400" : "hover:bg-white focus-visible:ring-2 focus-visible:ring-[#534AB7]"}`} aria-label={`Find the flower difference in picture ${side === "left" ? "A" : "B"}`}>
                  {side === "left" ? differences[1].left : differences[1].right}
                </button>
                <span>🪑</span>
                <button onClick={() => findDifference("bird")} className={`rounded-2xl p-2 transition ${found.includes("bird") ? "bg-emerald-100 ring-2 ring-emerald-400" : "hover:bg-white focus-visible:ring-2 focus-visible:ring-[#534AB7]"}`} aria-label={`Find the bird difference in picture ${side === "left" ? "A" : "B"}`}>
                  {side === "left" ? differences[2].left : <span className="inline-block w-10" aria-hidden="true" />}
                </button>
                <span>🐕</span>
                <span>🌿</span>
              </div>
            </section>
          ))}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <p className="text-slate-500 font-bold text-center">{remaining.length ? t("games.spotTheDifference.differencesLeft", { count: remaining.length }) : t("games.spotTheDifference.allFound")}</p>
          <button onClick={restart} className="px-5 py-2.5 rounded-xl bg-[#534AB7] hover:bg-[#44399A] text-white font-bold flex items-center gap-2 transition cursor-pointer">
            <RotateCcw size={18} />
            {t("common.playAgain")}
          </button>
          {complete && <Trophy size={28} className="text-amber-500" aria-label="Completed" />}
        </div>
      </div>
    </div>
  );
}

export default SpotTheDifference;
