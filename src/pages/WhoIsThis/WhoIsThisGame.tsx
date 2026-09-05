import { useState, useCallback, useRef, useEffect } from "react";
import { ChevronLeft, Users } from "lucide-react";
import { useNavigate } from "react-router";

import type {
  Difficulty,
  GameState,
  GameQuestion,
  GameResponse,
  GameSession,
  Person,
} from "./types";
import { MOCK_PEOPLE, MIN_PEOPLE_REQUIRED, QUESTIONS_PER_SESSION } from "./data";
import { GAME_LABELS } from "./gameLabels";
import { generateQuestion } from "./gameLogic";
import {
  getAdaptiveDifficulty,
  calculateAccuracy,
  calculateAverageResponseTime,
} from "./difficulty";
import {
  saveGameResponse,
  saveGameSession,
  saveGameSettings,
  getGameSettings,
} from "./storage";

import GameIntro from "./GameIntro";
import QuestionScreen from "./QuestionScreen";
import AnswerFeedback from "./AnswerFeedback";
import GameProgress from "./GameProgress";
import SessionSummary from "./SessionSummary";

/**
 * Root orchestrator for the "Who Is This?" memory game.
 *
 * State machine: intro → playing → feedback → completed
 *
 * Manages the full game lifecycle including question generation,
 * answer evaluation, difficulty adaptation, and session persistence.
 */
export default function WhoIsThisGame() {
  const navigate = useNavigate();

  // ─── Game state ───
  const [gameState, setGameState] = useState<GameState>("intro");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [people] = useState<Person[]>(MOCK_PEOPLE);

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

  // Timer ref for response time tracking
  const questionStartTimeRef = useRef<number>(Date.now());

  // Track recently shown person IDs to avoid repetition
  const recentPersonIdsRef = useRef<string[]>([]);

  // Load saved settings on mount
  useEffect(() => {
    getGameSettings().then((settings) => {
      if (settings.currentDifficulty) {
        setDifficulty(settings.currentDifficulty);
      }
    });
  }, []);

  // ─── Generate next question ───
  const generateNextQuestion = useCallback(
    (diff: Difficulty) => {
      const question = generateQuestion(
        people,
        diff,
        recentPersonIdsRef.current,
      );

      // Track recently shown correct person
      recentPersonIdsRef.current = [
        ...recentPersonIdsRef.current.slice(-4),
        question.correctPersonId,
      ];

      setCurrentQuestion(question);
      setSelectedPersonId(null);
      setIsCorrect(null);
      setIsRevealed(false);
      questionStartTimeRef.current = Date.now();
    },
    [people],
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

      if (correct) {
        setScore((prev) => prev + 1);
      }

      // Record response
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
      saveGameResponse(response);

      // Show feedback after a short pause
      setTimeout(() => {
        setGameState("feedback");
      }, 600);
    },
    [isRevealed, currentQuestion],
  );

  // ─── Continue to next question ───
  const handleContinue = useCallback(() => {
    const nextIndex = currentQuestionIndex + 1;

    if (nextIndex > QUESTIONS_PER_SESSION) {
      // Session complete
      const allResponses = [...responses];
      const accuracy = calculateAccuracy(allResponses);
      const avgResponseTime = calculateAverageResponseTime(allResponses);

      const session: GameSession = {
        id: sessionId,
        startedAt: sessionStartTime,
        completedAt: Date.now(),
        score,
        totalQuestions: QUESTIONS_PER_SESSION,
        correctAnswers: score,
        accuracy,
        averageResponseTime: avgResponseTime,
        difficulty,
      };

      saveGameSession(session);
      saveGameSettings({
        userId: "default",
        currentDifficulty: difficulty,
        lastPlayed: Date.now(),
      });

      setGameState("completed");
      return;
    }

    // Adapt difficulty every 5 questions
    let newDifficulty = difficulty;
    if (responses.length > 0 && responses.length % 5 === 0) {
      newDifficulty = getAdaptiveDifficulty(responses, difficulty);
      if (newDifficulty !== difficulty) {
        setDifficulty(newDifficulty);
        saveGameSettings({
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

  // ─── Not enough people check ───
  if (people.length < MIN_PEOPLE_REQUIRED) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-[20px] transition-colors cursor-pointer"
        >
          <ChevronLeft size={18} />
          {GAME_LABELS.backToGames}
        </button>
        <div className="text-center py-16 space-y-4">
          <Users size={48} className="text-slate-300 mx-auto" />
          <p className="text-xl font-bold text-slate-500">
            {GAME_LABELS.notEnoughPeople}
          </p>
        </div>
      </div>
    );
  }

  // ─── Find the correct person for feedback ───
  const correctPerson = currentQuestion
    ? currentQuestion.options.find(
        (p) => p.id === currentQuestion.correctPersonId,
      ) ?? null
    : null;

  return (
    <div className="space-y-5 md:space-y-6 animate-in fade-in duration-300">
      {/* Back button — always visible */}
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-[20px] transition-colors cursor-pointer"
      >
        <ChevronLeft size={18} />
        {GAME_LABELS.backToGames}
      </button>

      {/* ─── INTRO STATE ─── */}
      {gameState === "intro" && (
        <GameIntro difficulty={difficulty} onStart={handleStartGame} />
      )}

      {/* ─── PLAYING STATE ─── */}
      {gameState === "playing" && currentQuestion && (
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#FFF0F3] border-2 border-[#FFE0E6] flex items-center justify-center">
              <Users size={22} className="text-[#FF6584]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#1E2445] leading-tight">
                {GAME_LABELS.gameTitle}
              </h1>
              <p className="text-[18px] sm:text-[20px] text-slate-500 font-medium">
                {GAME_LABELS.gameSubtitle}
              </p>
            </div>
          </div>

          <GameProgress
            currentQuestion={currentQuestionIndex}
            totalQuestions={QUESTIONS_PER_SESSION}
            score={score}
          />

          <div className="bg-white border-2 border-slate-100 rounded-3xl shadow-md p-5 sm:p-6 md:p-8">
            <QuestionScreen
              question={currentQuestion}
              difficulty={difficulty}
              selectedPersonId={selectedPersonId}
              isRevealed={isRevealed}
              isCorrect={isCorrect}
              onSelectPerson={handleSelectPerson}
            />
          </div>
        </div>
      )}

      {/* ─── FEEDBACK STATE ─── */}
      {gameState === "feedback" && correctPerson && (
        <div className="space-y-5">
          <GameProgress
            currentQuestion={currentQuestionIndex}
            totalQuestions={QUESTIONS_PER_SESSION}
            score={score}
          />

          <AnswerFeedback
            correctPerson={correctPerson}
            isCorrect={isCorrect ?? false}
            onContinue={handleContinue}
          />
        </div>
      )}

      {/* ─── COMPLETED STATE ─── */}
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

