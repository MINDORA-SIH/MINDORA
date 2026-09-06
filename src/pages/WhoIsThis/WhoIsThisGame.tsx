import { ChevronLeft, Users } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { usePeople } from "@/hooks/usePeople";
import AnswerFeedback from "./AnswerFeedback";
import {
  calculateAccuracy,
  calculateAverageResponseTime,
  getAdaptiveDifficulty,
} from "./difficulty";
import GameIntro from "./GameIntro";
import { MIN_ACTIVE_PEOPLE, QUESTIONS_PER_SESSION } from "./gameConfig";
import { useGameLabels } from "./gameLabels";
import { generateQuestion } from "./gameLogic";
import GameProgress from "./GameProgress";
import QuestionScreen from "./QuestionScreen";
import SessionSummary from "./SessionSummary";
import {
  getGameSettings,
  saveGameResponse,
  saveGameSession,
  saveGameSettings,
} from "./storage";
import type {
  Difficulty,
  GameQuestion,
  GameResponse,
  GameSession,
  GameState,
} from "./types";

/** Recently asked people to keep out of the next question. */
const RECENT_MEMORY = 4;
/** Answers between adaptive-difficulty checks. */
const ADAPT_EVERY = 5;
/** Pause after a tap, so the chosen name is seen before the feedback screen. */
const REVEAL_PAUSE_MS = 600;

const BACK_BUTTON_CLASS =
  "flex cursor-pointer items-center gap-2 text-[20px] font-bold text-slate-500 transition-colors hover:text-slate-800";

/**
 * Root orchestrator for the "Who Is This?" memory game.
 *
 * State machine: intro → playing → feedback → completed. People come from the
 * caregiver's records, so a Manage Game Data change reaches the game with no reload.
 */
export default function WhoIsThisGame() {
  const navigate = useNavigate();
  const { activePeople, isLoading } = usePeople();
  const labels = useGameLabels();

  // ─── Game state ───
  const [gameState, setGameState] = useState<GameState>("intro");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");

  // Question tracking
  const [currentQuestion, setCurrentQuestion] = useState<GameQuestion | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  // Session tracking
  const [score, setScore] = useState(0);
  const [responses, setResponses] = useState<GameResponse[]>([]);
  const [sessionId] = useState(
    () => `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  );
  const [sessionStartTime] = useState(() => Date.now());

  const questionStartTimeRef = useRef<number>(Date.now());
  const recentPersonIdsRef = useRef<string[]>([]);

  // Difficulty carries over between sessions.
  useEffect(() => {
    void getGameSettings().then((settings) => setDifficulty(settings.currentDifficulty));
  }, []);

  // ─── Generate next question ───
  const generateNextQuestion = useCallback(
    (diff: Difficulty) => {
      // Deactivating people mid-session can empty the pool; the guard below
      // renders instead, so there is nothing to generate.
      if (activePeople.length < MIN_ACTIVE_PEOPLE) return;

      const question = generateQuestion(activePeople, diff, recentPersonIdsRef.current);

      // Remember recent people, but never so many that no candidate is left.
      const memory = Math.min(RECENT_MEMORY, activePeople.length - 1);
      recentPersonIdsRef.current = [
        ...recentPersonIdsRef.current,
        question.correctPersonId,
      ].slice(-memory);

      setCurrentQuestion(question);
      setSelectedPersonId(null);
      setIsCorrect(null);
      setIsRevealed(false);
      questionStartTimeRef.current = Date.now();
    },
    [activePeople],
  );

  // ─── Start game ───
  const handleStartGame = useCallback(() => {
    setGameState("playing");
    setCurrentQuestionIndex(1);
    setScore(0);
    setResponses([]);
    recentPersonIdsRef.current = [];
    generateNextQuestion(difficulty);
  }, [difficulty, generateNextQuestion]);

  // ─── Handle answer selection ───
  const handleSelectPerson = useCallback(
    (personId: string) => {
      if (isRevealed || !currentQuestion) return;

      const responseTimeMs = Date.now() - questionStartTimeRef.current;
      const correct = personId === currentQuestion.correctPersonId;

      setSelectedPersonId(personId);
      setIsCorrect(correct);
      setIsRevealed(true);
      if (correct) setScore((prev) => prev + 1);

      // Recorded by person id, so later renames leave this answer intact.
      const response: GameResponse = {
        questionId: currentQuestion.id,
        selectedPersonId: personId,
        correctPersonId: currentQuestion.correctPersonId,
        isCorrect: correct,
        responseTimeMs,
        difficulty: currentQuestion.difficulty,
        timestamp: Date.now(),
      };

      setResponses((prev) => [...prev, response]);
      void saveGameResponse(response);

      setTimeout(() => setGameState("feedback"), REVEAL_PAUSE_MS);
    },
    [isRevealed, currentQuestion],
  );

  // ─── Continue to next question ───
  const handleContinue = useCallback(() => {
    const nextIndex = currentQuestionIndex + 1;

    if (nextIndex > QUESTIONS_PER_SESSION) {
      const session: GameSession = {
        id: sessionId,
        startedAt: sessionStartTime,
        completedAt: Date.now(),
        score,
        totalQuestions: QUESTIONS_PER_SESSION,
        correctAnswers: score,
        accuracy: calculateAccuracy(responses),
        averageResponseTime: calculateAverageResponseTime(responses),
        difficulty,
      };

      void saveGameSession(session);
      void saveGameSettings({
        userId: "default",
        currentDifficulty: difficulty,
        lastPlayed: Date.now(),
      });

      setGameState("completed");
      return;
    }

    // Difficulty is tracked, not used to change the four options.
    let newDifficulty = difficulty;
    if (responses.length > 0 && responses.length % ADAPT_EVERY === 0) {
      newDifficulty = getAdaptiveDifficulty(responses, difficulty);
      if (newDifficulty !== difficulty) {
        setDifficulty(newDifficulty);
        void saveGameSettings({
          userId: "default",
          currentDifficulty: newDifficulty,
          lastPlayed: Date.now(),
        });
      }
    }

    setCurrentQuestionIndex(nextIndex);
    setGameState("playing");
    generateNextQuestion(newDifficulty);
  }, [
    currentQuestionIndex,
    responses,
    difficulty,
    score,
    sessionId,
    sessionStartTime,
    generateNextQuestion,
  ]);

  // ─── Play again ───
  const handlePlayAgain = useCallback(() => {
    setGameState("intro");
    setCurrentQuestionIndex(0);
    setScore(0);
    setResponses([]);
    setCurrentQuestion(null);
    setSelectedPersonId(null);
    setIsCorrect(null);
    setIsRevealed(false);
    recentPersonIdsRef.current = [];
  }, []);

  const backButton = (
    <button type="button" onClick={() => navigate("/")} className={BACK_BUTTON_CLASS}>
      <ChevronLeft size={18} />
      {labels.backToGames}
    </button>
  );

  // ─── Waiting for the caregiver's people ───
  if (isLoading) {
    return (
      <div className="space-y-6">
        {backButton}
        <p className="py-16 text-center text-xl font-bold text-slate-500">Loading…</p>
      </div>
    );
  }

  // ─── Too few active people to build four options ───
  if (activePeople.length < MIN_ACTIVE_PEOPLE) {
    return (
      <div className="space-y-6">
        {backButton}
        <div className="space-y-4 py-16 text-center">
          <Users size={48} className="mx-auto text-slate-300" />
          <p className="text-xl font-bold text-slate-500">{labels.notEnoughPeople}</p>
          <p className="text-lg font-semibold text-slate-400">
            {labels.notEnoughPeopleHint}
          </p>
          <button
            type="button"
            onClick={() => navigate("/manage-data")}
            className="mt-2 min-h-[52px] cursor-pointer rounded-2xl bg-[#FF6584] px-8 py-3.5 text-lg font-extrabold text-white shadow-md transition-all hover:bg-[#e8506e] active:scale-[0.97]"
          >
            {labels.manageDataButton}
          </button>
        </div>
      </div>
    );
  }

  // The person in the photo, resolved from the question's own options.
  const personInPhoto =
    currentQuestion?.options.find((person) => person.id === currentQuestion.correctPersonId) ??
    null;

  return (
    <div className="animate-in fade-in space-y-5 duration-300 md:space-y-6">
      {backButton}

      {/* ─── INTRO ─── */}
      {gameState === "intro" && (
        <GameIntro difficulty={difficulty} onStart={handleStartGame} />
      )}

      {/* ─── PLAYING ─── */}
      {gameState === "playing" && currentQuestion && personInPhoto && (
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#FFE0E6] bg-[#FFF0F3] sm:h-12 sm:w-12">
              <Users size={22} className="text-[#FF6584]" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold leading-tight text-[#1E2445] sm:text-2xl">
                {labels.gameTitle}
              </h1>
              <p className="text-[18px] font-medium text-slate-500 sm:text-[20px]">
                {labels.gameSubtitle}
              </p>
            </div>
          </div>

          <GameProgress
            currentQuestion={currentQuestionIndex}
            totalQuestions={QUESTIONS_PER_SESSION}
            score={score}
          />

          <div className="rounded-3xl border-2 border-slate-100 bg-white p-5 shadow-md sm:p-6 md:p-8">
            <QuestionScreen
              question={currentQuestion}
              personInPhoto={personInPhoto}
              selectedPersonId={selectedPersonId}
              isRevealed={isRevealed}
              onSelectPerson={handleSelectPerson}
            />
          </div>
        </div>
      )}

      {/* ─── FEEDBACK ─── */}
      {gameState === "feedback" && personInPhoto && (
        <div className="space-y-5">
          <GameProgress
            currentQuestion={currentQuestionIndex}
            totalQuestions={QUESTIONS_PER_SESSION}
            score={score}
          />

          <AnswerFeedback
            correctPerson={personInPhoto}
            isCorrect={isCorrect ?? false}
            onContinue={handleContinue}
          />
        </div>
      )}

      {/* ─── COMPLETED ─── */}
      {gameState === "completed" && (
        <SessionSummary
          score={score}
          totalQuestions={QUESTIONS_PER_SESSION}
          accuracy={calculateAccuracy(responses)}
          averageResponseTime={calculateAverageResponseTime(responses)}
          difficulty={difficulty}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </div>
  );
}
