import { useState, useEffect, useCallback, useRef } from "react";
import { Palette, ChevronLeft, RotateCcw, Star, Trophy, Heart, Volume2 } from "lucide-react";
import { useNavigate } from "react-router";

const COLORS = [
  { id: "red", bg: "bg-red-500", activeBg: "bg-red-300", border: "border-red-600", label: "Red" },
  { id: "blue", bg: "bg-blue-500", activeBg: "bg-blue-300", border: "border-blue-600", label: "Blue" },
  { id: "green", bg: "bg-green-500", activeBg: "bg-green-300", border: "border-green-600", label: "Green" },
  { id: "yellow", bg: "bg-yellow-400", activeBg: "bg-yellow-200", border: "border-yellow-500", label: "Yellow" },
];

type GameState = "idle" | "showing" | "input" | "correct" | "gameover" | "result";

export function ColorSequence() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState>("idle");
  const [gameSeq, setGameSeq] = useState<string[]>([]);
  const [userSeq, setUserSeq] = useState<string[]>([]);
  const [level, setLevel] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [flashingColor, setFlashingColor] = useState<string | null>(null);
  const [userFlash, setUserFlash] = useState<string | null>(null);
  const [showingIndex, setShowingIndex] = useState(-1);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Auto-start game on mount
  useEffect(() => {
    if (gameState === "idle") {
      startGame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const playSequence = useCallback((sequence: string[]) => {
    setGameState("showing");
    setShowingIndex(-1);

    sequence.forEach((color, index) => {
      setTimeout(() => {
        setFlashingColor(color);
        setShowingIndex(index);
        setTimeout(() => {
          setFlashingColor(null);
        }, 400);
      }, (index + 1) * 700);
    });

    setTimeout(() => {
      setGameState("input");
      setShowingIndex(-1);
    }, (sequence.length + 1) * 700);
  }, []);

  const levelUp = useCallback(() => {
    const randColor = COLORS[Math.floor(Math.random() * 4)].id;
    const newSeq = [...gameSeq, randColor];
    setGameSeq(newSeq);
    setUserSeq([]);
    setLevel((prev) => prev + 1);

    // Brief pause before showing sequence
    setTimeout(() => {
      playSequence(newSeq);
    }, 500);
  }, [gameSeq, playSequence]);

  const startGame = useCallback(() => {
    setGameSeq([]);
    setUserSeq([]);
    setLevel(0);
    setGameState("showing");

    // Start first level
    const randColor = COLORS[Math.floor(Math.random() * 4)].id;
    const newSeq = [randColor];
    setGameSeq(newSeq);
    setLevel(1);

    setTimeout(() => {
      playSequence(newSeq);
    }, 500);
  }, [playSequence]);

  const handleColorPress = useCallback(
    (colorId: string) => {
      if (gameState !== "input") return;

      // User flash feedback
      setUserFlash(colorId);
      setTimeout(() => setUserFlash(null), 200);

      const newUserSeq = [...userSeq, colorId];
      setUserSeq(newUserSeq);
      const idx = newUserSeq.length - 1;

      if (newUserSeq[idx] === gameSeq[idx]) {
        // Correct so far
        if (newUserSeq.length === gameSeq.length) {
          // Completed the level
          setGameState("correct");
          timeoutRef.current = setTimeout(() => {
            levelUp();
          }, 1000);
        }
      } else {
        // Wrong answer
        const newHighScore = Math.max(highScore, level);
        setHighScore(newHighScore);
        setGameState("gameover");
      }
    },
    [gameState, userSeq, gameSeq, level, highScore, levelUp]
  );

  const handleGameOver = () => {
    setGameState("result");
  };

  const handleRestart = () => {
    startGame();
  };

  const handleBackToIdle = () => {
    setGameState("idle");
    setGameSeq([]);
    setUserSeq([]);
    setLevel(0);
  };

  // Result screen
  if (gameState === "result") {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-[20px] transition-colors cursor-pointer"
        >
          <ChevronLeft size={18} />
          Back to Games
        </button>

        <div className="flex flex-col items-center text-center py-8 md:py-12">
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-purple-100 to-violet-200 flex items-center justify-center mb-6 shadow-lg">
            {level >= 10 ? (
              <Trophy size={48} className="text-amber-500" />
            ) : level >= 5 ? (
              <Star size={48} className="text-purple-500" />
            ) : (
              <Heart size={48} className="text-pink-500" />
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E2445]">
            {level >= 10 ? "Amazing Memory!" : level >= 5 ? "Great Job!" : "Nice Try!"}
          </h2>
          <p className="text-slate-500 font-bold text-[20px] sm:text-base mt-2 max-w-xs">
            You reached{" "}
            <span className="font-extrabold text-[#9333EA]">Level {level}</span> in Color Sequence!
          </p>

          {/* Score Circle */}
          <div className="mt-6 w-32 h-32 md:w-36 md:h-36 rounded-full border-[6px] border-purple-200 flex flex-col items-center justify-center bg-white shadow-md">
            <span className="text-4xl md:text-5xl font-extrabold text-[#9333EA]">{level}</span>
            <span className="text-[18px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">Level</span>
          </div>

          {highScore > 0 && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
              <p className="text-[20px] font-bold text-amber-800">
                🏆 Best Score: Level {highScore}
              </p>
            </div>
          )}

          <div className="flex gap-3 mt-8">
            <button
              onClick={handleRestart}
              className="px-6 py-3 bg-[#9333EA] text-white font-bold rounded-xl hover:bg-[#7928CA] transition-all shadow-sm cursor-pointer flex items-center gap-2 min-h-[48px]"
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
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-[20px] transition-colors cursor-pointer"
      >
        <ChevronLeft size={18} />
        Back to Games
      </button>

      {/* Game Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#F5F0FF] border-2 border-[#EBE0FF] flex items-center justify-center">
            <Palette size={22} className="text-[#9333EA]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#1E2445] leading-tight">Color Sequence</h1>
            <p className="text-[18px] sm:text-[20px] text-slate-500 font-bold">Remember & repeat the pattern</p>
          </div>
        </div>

        {/* Level & High Score */}
        <div className="flex items-center gap-2">
          {highScore > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5 hidden sm:flex items-center gap-1.5">
              <Trophy size={14} className="text-amber-500" />
              <span className="font-extrabold text-[18px] text-amber-700">{highScore}</span>
            </div>
          )}
          <div className="bg-[#F5F0FF] border-2 border-[#EBE0FF] rounded-full px-4 py-1.5 flex items-center gap-1.5">
            <Star size={16} className="text-[#9333EA]" />
            <span className="font-extrabold text-[20px] text-[#1E2445]">
              Lvl {level}
            </span>
          </div>
        </div>
      </div>

      {/* Game Card */}
      <div className="bg-white border-2 border-slate-100 rounded-3xl shadow-md p-5 sm:p-6 md:p-8">
        {/* Status Message */}
        <div className="text-center mb-6">

          {gameState === "showing" && (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Volume2 size={20} className="text-[#9333EA] animate-pulse" />
                <h3 className="text-lg font-extrabold text-[#9333EA]">Watch carefully!</h3>
              </div>
              <p className="text-[20px] text-slate-500 font-bold">
                Showing color {showingIndex + 1} of {gameSeq.length}
              </p>
            </div>
          )}
          {gameState === "input" && (
            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-[#1E2445]">Your turn!</h3>
              <p className="text-[20px] text-slate-500 font-bold">
                Tap the colors in the right order ({userSeq.length}/{gameSeq.length})
              </p>
            </div>
          )}
          {gameState === "correct" && (
            <div className="space-y-1 animate-in fade-in duration-200">
              <h3 className="text-lg font-extrabold text-emerald-600">✅ Correct!</h3>
              <p className="text-[20px] text-slate-500 font-bold">
                Get ready for the next level...
              </p>
            </div>
          )}
          {gameState === "gameover" && (
            <div className="space-y-2 animate-in fade-in duration-200">
              <h3 className="text-lg font-extrabold text-red-500">❌ Wrong Color!</h3>
              <p className="text-[20px] text-slate-500 font-bold">
                You reached <span className="font-extrabold text-[#9333EA]">Level {level}</span>
              </p>
            </div>
          )}
        </div>

        {/* Color Pads — 2x2 Grid */}
        <div className="max-w-[320px] sm:max-w-[360px] mx-auto">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {COLORS.map((color) => {
              const isFlashing = flashingColor === color.id;
              const isUserFlash = userFlash === color.id;
              const isDisabled = gameState !== "input";
              const isActive = isFlashing || isUserFlash;

              return (
                <button
                  key={color.id}
                  onClick={() => handleColorPress(color.id)}
                  disabled={isDisabled}
                  className={`aspect-square rounded-2xl sm:rounded-3xl border-4 transition-all duration-150 ${
                    isActive
                      ? `${color.activeBg} ${color.border} scale-95 shadow-lg ring-4 ring-white/50`
                      : `${color.bg} ${color.border} shadow-md`
                  } ${
                    !isDisabled
                      ? "cursor-pointer hover:scale-[1.03] active:scale-95 hover:shadow-lg"
                      : "cursor-default"
                  } ${
                    gameState === "gameover" ? "opacity-50" : ""
                  }`}
                  aria-label={color.label}
                />
              );
            })}
          </div>
        </div>

        {/* Progress dots for sequence */}
        {(gameState === "input" || gameState === "showing") && gameSeq.length > 0 && (
          <div className="flex items-center justify-center gap-1.5 mt-5">
            {gameSeq.map((colorId, idx) => {
              const color = COLORS.find((c) => c.id === colorId);
              const isFilled = gameState === "input" ? idx < userSeq.length : idx <= showingIndex;
              return (
                <div
                  key={idx}
                  className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border-2 transition-all duration-200 ${
                    isFilled
                      ? `${color?.bg || "bg-slate-400"} border-transparent scale-110`
                      : "bg-white border-slate-300"
                  }`}
                />
              );
            })}
          </div>
        )}

        {/* Game Over Buttons */}
        {gameState === "gameover" && (
          <div className="flex items-center justify-center gap-3 mt-6 animate-in fade-in duration-200">
            <button
              onClick={handleRestart}
              className="px-6 py-3 bg-[#9333EA] text-white font-bold rounded-xl hover:bg-[#7928CA] transition-all shadow-sm cursor-pointer flex items-center gap-2 min-h-[48px]"
            >
              <RotateCcw size={18} />
              Try Again
            </button>
            <button
              onClick={handleGameOver}
              className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all shadow-sm cursor-pointer min-h-[48px]"
            >
              See Results
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ColorSequence;

