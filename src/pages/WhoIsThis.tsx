import { useState } from "react";
import { Users, ChevronLeft, ChevronRight, CheckCircle, XCircle, RotateCcw, Star, Heart } from "lucide-react";
import { useNavigate } from "react-router";

interface FamilyMember {
  id: number;
  name: string;
  relation: string;
  emoji: string;
  hint: string;
  options: string[];
  correctAnswer: string;
}

const familyMembers: FamilyMember[] = [
  {
    id: 1,
    name: "Ravi",
    relation: "Son",
    emoji: "👨",
    hint: "This person visits you every weekend and brings your favorite sweets.",
    options: ["Ravi (Son)", "Amit (Nephew)", "Suresh (Brother)", "Vikram (Neighbor)"],
    correctAnswer: "Ravi (Son)",
  },
  {
    id: 2,
    name: "Priya",
    relation: "Daughter",
    emoji: "👩",
    hint: "She calls you every morning and lives in Bangalore.",
    options: ["Meera (Sister)", "Priya (Daughter)", "Anita (Friend)", "Kavita (Cousin)"],
    correctAnswer: "Priya (Daughter)",
  },
  {
    id: 3,
    name: "Arjun",
    relation: "Grandson",
    emoji: "👦",
    hint: "This little one loves to play cricket and calls you 'Dadi'.",
    options: ["Rohan (Nephew)", "Karan (Neighbor)", "Arjun (Grandson)", "Dev (Friend's son)"],
    correctAnswer: "Arjun (Grandson)",
  },
  {
    id: 4,
    name: "Sunita",
    relation: "Sister",
    emoji: "👩‍🦳",
    hint: "You grew up together and she lives in the same city as you.",
    options: ["Kamla (Aunt)", "Sunita (Sister)", "Geeta (Cousin)", "Lata (Neighbor)"],
    correctAnswer: "Sunita (Sister)",
  },
  {
    id: 5,
    name: "Ananya",
    relation: "Granddaughter",
    emoji: "👧",
    hint: "She loves drawing and always makes birthday cards for you.",
    options: ["Ananya (Granddaughter)", "Sita (Niece)", "Pooja (Cousin)", "Rina (Friend)"],
    correctAnswer: "Ananya (Granddaughter)",
  },
];

export function WhoIsThis() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<Set<number>>(new Set());
  const [showResult, setShowResult] = useState(false);

  const currentMember = familyMembers[currentIndex];
  const totalCards = familyMembers.length;

  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return; // Already answered
    setSelectedAnswer(answer);
    const correct = answer === currentMember.correctAnswer;
    setIsCorrect(correct);
    if (correct) {
      setScore((prev) => prev + 1);
    }
    setAnswered((prev) => new Set(prev).add(currentIndex));
  };

  const handleNext = () => {
    if (currentIndex < totalCards - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
    } else {
      setShowResult(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setScore(0);
    setAnswered(new Set());
    setShowResult(false);
  };

  if (showResult) {
    const percentage = Math.round((score / totalCards) * 100);
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-sm transition-colors cursor-pointer"
        >
          <ChevronLeft size={18} />
          Back to Games
        </button>

        <div className="flex flex-col items-center text-center py-8 md:py-12">
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-pink-100 to-rose-200 flex items-center justify-center mb-6 shadow-lg">
            {percentage >= 80 ? (
              <Star size={48} className="text-amber-500" />
            ) : percentage >= 50 ? (
              <Heart size={48} className="text-pink-500" />
            ) : (
              <RotateCcw size={48} className="text-slate-500" />
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E2445]">
            {percentage >= 80
              ? "Wonderful Memory!"
              : percentage >= 50
                ? "Great Effort!"
                : "Keep Practicing!"}
          </h2>
          <p className="text-slate-500 font-medium text-sm sm:text-base mt-2 max-w-xs">
            You recognized{" "}
            <span className="font-extrabold text-[#FF6584]">
              {score} out of {totalCards}
            </span>{" "}
            family members correctly.
          </p>

          {/* Score Circle */}
          <div className="mt-6 w-32 h-32 md:w-36 md:h-36 rounded-full border-[6px] border-pink-200 flex flex-col items-center justify-center bg-white shadow-md">
            <span className="text-4xl md:text-5xl font-extrabold text-[#FF6584]">{percentage}%</span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide mt-0.5">Score</span>
          </div>

          <div className="flex gap-3 mt-8">
            <button
              onClick={handleRestart}
              className="px-6 py-3 bg-[#FF6584] text-white font-bold rounded-xl hover:bg-[#e8506e] transition-all shadow-sm cursor-pointer flex items-center gap-2 min-h-[48px]"
            >
              <RotateCcw size={18} />
              Play Again
            </button>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all shadow-sm cursor-pointer min-h-[48px]"
            >
              All Games
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 md:space-y-6 animate-in fade-in duration-300">
      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-sm transition-colors cursor-pointer"
      >
        <ChevronLeft size={18} />
        Back to Games
      </button>

      {/* Game Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#FFF0F3] border-2 border-[#FFE0E6] flex items-center justify-center">
            <Users size={22} className="text-[#FF6584]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#1E2445] leading-tight">Who is this?</h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">Identify your family members</p>
          </div>
        </div>

        {/* Score Badge */}
        <div className="bg-[#FFF0F3] border-2 border-[#FFE0E6] rounded-full px-4 py-1.5 flex items-center gap-1.5">
          <Star size={16} className="text-amber-500" />
          <span className="font-extrabold text-sm text-[#1E2445]">
            {score}/{totalCards}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#FF6584] to-[#FF8FA3] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${((currentIndex + 1) / totalCards) * 100}%` }}
        />
      </div>
      <p className="text-xs font-bold text-slate-400 text-right -mt-3">
        Card {currentIndex + 1} of {totalCards}
      </p>

      {/* Card */}
      <div className="bg-white border-2 border-slate-100 rounded-3xl shadow-md p-5 sm:p-6 md:p-8 space-y-5 md:space-y-6">
        {/* Person Emoji & Hint */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-pink-50 to-rose-100 border-4 border-pink-200 flex items-center justify-center shadow-inner">
            <span className="text-5xl sm:text-6xl md:text-7xl">{currentMember.emoji}</span>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 max-w-sm">
            <p className="text-sm sm:text-base font-bold text-amber-800 leading-snug">
              💡 <span className="italic">{currentMember.hint}</span>
            </p>
          </div>
        </div>

        {/* Question */}
        <h3 className="text-center text-lg sm:text-xl font-extrabold text-[#1E2445]">Who is this person?</h3>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {currentMember.options.map((option) => {
            const isSelected = selectedAnswer === option;
            const isCorrectOption = option === currentMember.correctAnswer;
            let optionStyle = "bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-800";

            if (selectedAnswer) {
              if (isCorrectOption) {
                optionStyle = "bg-emerald-50 border-emerald-400 text-emerald-800";
              } else if (isSelected && !isCorrect) {
                optionStyle = "bg-red-50 border-red-400 text-red-800";
              } else {
                optionStyle = "bg-slate-50 border-slate-200 text-slate-400";
              }
            }

            return (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                disabled={!!selectedAnswer}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 font-bold text-sm sm:text-base transition-all cursor-pointer min-h-[56px] ${optionStyle} ${!selectedAnswer ? "active:scale-[0.98]" : ""}`}
              >
                {selectedAnswer && isCorrectOption && <CheckCircle size={20} className="text-emerald-500 flex-shrink-0" />}
                {selectedAnswer && isSelected && !isCorrect && <XCircle size={20} className="text-red-500 flex-shrink-0" />}
                <span className="text-left">{option}</span>
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {selectedAnswer && (
          <div
            className={`text-center py-3 px-4 rounded-xl font-bold text-sm sm:text-base animate-in fade-in duration-200 ${
              isCorrect ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {isCorrect
              ? `✅ Correct! That is ${currentMember.name}, your ${currentMember.relation}.`
              : `❌ That was ${currentMember.name}, your ${currentMember.relation}. Keep trying!`}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2 pb-4">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed min-h-[48px]"
        >
          <ChevronLeft size={18} />
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={!selectedAnswer}
          className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm bg-[#FF6584] text-white hover:bg-[#e8506e] transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed min-h-[48px] shadow-sm"
        >
          {currentIndex < totalCards - 1 ? "Next Card" : "See Results"}
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

export default WhoIsThis;
