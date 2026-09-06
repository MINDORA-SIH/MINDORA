import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  Check,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Lightbulb,
  ListChecks,
  RotateCcw,
  Trophy,
  Volume2,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router"
import { useTranslation } from "react-i18next"
import { fallbackRoutine, saveRoutineSession } from "@/data/routineRepository"
import {
  DEFAULT_PATIENT,
  categoryLabel,
  shuffleSteps,
  stepsForDifficulty,
  type Routine,
  type RoutineDifficulty,
  type RoutineGameSession,
  type RoutineStep,
} from "@/data/routineTypes"
import { useRoutines } from "@/hooks/useRoutines"

function GameStep({
  step,
  index,
  count,
  showCue,
  onMove,
}: {
  step: RoutineStep
  index: number
  count: number
  showCue: boolean
  onMove: (direction: -1 | 1) => void
}) {
  const { t } = useTranslation()
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id })
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-3 rounded-2xl border-2 p-3 sm:p-4 ${
        isDragging
          ? "border-[#0F6E56] bg-[#E1F5EE] shadow-lg dark:bg-[#1E3B33]"
          : "border-slate-200 bg-white dark:border-slate-700"
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="tap-target shrink-0 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
        aria-label={t("routine.dragStep", "Drag {{title}}", {
          title: step.title,
        })}
      >
        <GripVertical />
      </button>
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#E1F5EE] text-[17px] font-extrabold text-[#0F6E56] dark:bg-[#1E3B33] dark:text-[#8FE3C8]">
        {index + 1}
      </span>
      <div className="min-w-0 flex-1">
        <p
          className="text-[19px] font-extrabold"
          style={{ color: "var(--foreground)" }}
        >
          {showCue ? `${step.icon ?? "✅"} ` : ""}
          {t(`activities.${step.title}`, step.title)}
        </p>
        {showCue && step.scheduledTime ? (
          <p
            className="text-[14px] font-bold"
            style={{ color: "var(--muted)" }}
          >
            {step.scheduledTime}
          </p>
        ) : null}
      </div>
      <div className="flex shrink-0 gap-1">
        <button
          type="button"
          onClick={() => onMove(-1)}
          disabled={index === 0}
          aria-label={t("routine.moveUpStep", "Move {{title}} up", {
            title: step.title,
          })}
          className="tap-target rounded-xl border border-slate-200 disabled:opacity-35 dark:border-slate-700"
        >
          <ChevronUp size={19} />
        </button>
        <button
          type="button"
          onClick={() => onMove(1)}
          disabled={index === count - 1}
          aria-label={t("routine.moveDownStep", "Move {{title}} down", {
            title: step.title,
          })}
          className="tap-target rounded-xl border border-slate-200 disabled:opacity-35 dark:border-slate-700"
        >
          <ChevronDown size={19} />
        </button>
      </div>
    </li>
  )
}

function RoutineGame({
  routine,
  onBack,
  onLevelUp,
}: {
  routine: Routine
  onBack: () => void
  onLevelUp: (level: RoutineDifficulty) => void
}) {
  const { t } = useTranslation()
  const [level, setLevel] = useState<RoutineDifficulty>(routine.difficulty)
  const [steps, setSteps] = useState<RoutineStep[]>(() =>
    shuffleSteps(stepsForDifficulty(routine)),
  )
  const [startedAt] = useState(() => Date.now())
  const [hints, setHints] = useState(0)
  const [retries, setRetries] = useState(0)
  const [errors, setErrors] = useState(0)
  const [result, setResult] = useState<{
    accuracy: number
    complete: boolean
  } | null>(null)
  const [saved, setSaved] = useState(false)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 180, tolerance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )
  const target = useMemo(
    () => stepsForDifficulty({ ...routine, difficulty: level }),
    [routine, level],
  )
  const showCue = level <= 2
  const reorder = (next: RoutineStep[]) => setSteps(next)
  const check = () => {
    if (result) return
    const correct = steps.reduce(
      (count, step, index) => count + (step.id === target[index]?.id ? 1 : 0),
      0,
    )
    const accuracy = Math.round((correct / Math.max(target.length, 1)) * 100)
    const complete = correct === target.length
    setResult({ accuracy, complete })
    if (complete && level < 4) {
      const nextLevel = (level + 1) as RoutineDifficulty
      setLevel(nextLevel)
      onLevelUp(nextLevel)
    }
    if (!complete) {
      setErrors((value) => value + (target.length - correct))
      setRetries((value) => value + 1)
    }
  }
  useEffect(() => {
    if (!result?.complete || saved) return
    const session: RoutineGameSession = {
      id: `routine-session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      patientId: DEFAULT_PATIENT.id,
      routineId: routine.id,
      startedAt: new Date(startedAt).toISOString(),
      completedAt: new Date().toISOString(),
      difficulty: level,
      score: result.accuracy,
      accuracy: result.accuracy,
      errors,
      hintsUsed: hints,
      retries,
      completionTimeMs: Date.now() - startedAt,
    }
    setSaved(true)
    void saveRoutineSession(session)
  }, [result, saved, routine, startedAt, errors, hints, retries, level])
  const reset = () => {
    setSteps(shuffleSteps(target))
    setResult(null)
    setHints(0)
    setRetries(0)
    setErrors(0)
  }
  const readInstructions = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      const message = new SpeechSynthesisUtterance(
        t(
          "routine.voiceInstructions",
          "Take your time. Use the up and down arrows to put the {{count}} activities in the order you usually do them. When you are ready, choose Check my order.",
          { count: target.length },
        ),
      )
      message.rate = 0.78
      window.speechSynthesis.speak(message)
    }
  }
  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={onBack}
        className="gap-2 text-[18px] font-bold"
        style={{ color: "var(--muted-strong)" }}
      >
        <ChevronLeft size={18} />{" "}
        {t("routine.chooseAnother", "Choose another routine")}
      </button>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl border-2 border-[#B6E3C8] bg-[#EDFBF3] text-2xl dark:border-[#27543E] dark:bg-[#12352A]">
            {routine.category === "morning" ? "🌅" : "🗓️"}
          </span>
          <div>
            <h1 className="text-2xl font-extrabold">
              {t(`routines.${routine.id}.name`, routine.name)}
            </h1>
            <p
              className="text-[16px] font-semibold"
              style={{ color: "var(--muted-strong)" }}
            >
              {t(
                "routine.putInOrder",
                "Put the activities in the order you usually do them.",
              )}
            </p>
          </div>
        </div>
        <span className="rounded-full border-2 border-[#B6E3C8] bg-[#EDFBF3] px-4 py-1.5 text-[15px] font-extrabold text-[#186B47] dark:border-[#27543E] dark:bg-[#12352A] dark:text-[#8FE3B4]">
          {t("routine.levelAndSteps", "Level {{level}} · {{count}} steps", {
            level,
            count: target.length,
          })}
        </span>
      </header>
      <section
        className="rounded-3xl border-2 border-slate-200 p-4 shadow-sm sm:p-6 dark:border-slate-700"
        style={{ backgroundColor: "var(--card-bg)" }}
      >
        <p
          className="mb-4 text-[16px] font-semibold"
          style={{ color: "var(--muted-strong)" }}
        >
          {t(
            "routine.gameInstructions",
            "Take your time. Use the large arrow buttons to move one activity at a time, then choose Check my order.",
          )}
        </p>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={({ active, over }) => {
            if (!result && over && active.id !== over.id) {
              const from = steps.findIndex((step) => step.id === active.id)
              const to = steps.findIndex((step) => step.id === over.id)
              reorder(arrayMove(steps, from, to))
            }
          }}
        >
          <SortableContext
            items={steps.map((step) => step.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="space-y-2">
              {steps.map((step, index) => (
                <GameStep
                  key={step.id}
                  step={step}
                  index={index}
                  count={steps.length}
                  showCue={showCue}
                  onMove={(direction) => {
                    if (!result)
                      reorder(arrayMove(steps, index, index + direction))
                  }}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={readInstructions}
            className="tap-target gap-2 rounded-2xl border-2 border-[#C3DEF7] bg-[#F1F7FE] px-5 text-[16px] font-extrabold text-[#185FA5] dark:border-[#2C4562] dark:bg-[#17293D] dark:text-[#9FD0FF]"
          >
            <Volume2 size={19} />{" "}
            {t("routine.readInstructions", "Read instructions")}
          </button>
          <button
            type="button"
            disabled={result !== null}
            onClick={() => setHints((value) => value + 1)}
            className="tap-target gap-2 rounded-2xl border-2 border-[#F0D79E] bg-[#FFF7E6] px-5 text-[16px] font-extrabold text-[#8A5B0B] disabled:opacity-50 dark:border-[#5E4718] dark:bg-[#3A2C10] dark:text-[#F5CE83]"
          >
            <Lightbulb size={19} /> {t("routine.showHint", "Show a hint")}
          </button>
          <button
            type="button"
            disabled={result !== null}
            onClick={check}
            className="tap-target gap-2 rounded-2xl bg-[#0F6E56] px-6 text-[16px] font-extrabold text-white shadow-md disabled:opacity-50"
          >
            <Check size={19} /> {t("routine.checkOrder", "Check my order")}
          </button>
        </div>
        {hints > 0 ? (
          <div className="mt-3 rounded-2xl border border-[#F0D79E] bg-[#FFF7E6] p-3 text-[15px] font-bold text-[#8A5B0B] dark:border-[#5E4718] dark:bg-[#3A2C10] dark:text-[#F5CE83]">
            {t("routine.hintLabel", "Hint:")}{" "}
            {target
              .map(
                (step) =>
                  step.hint ||
                  step.scheduledTime ||
                  t(`activities.${step.title}`, step.title),
              )
              .join(" → ")}
          </div>
        ) : null}
        {result ? (
          <div
            role="status"
            aria-live="polite"
            className={`mt-4 rounded-2xl border-2 p-4 ${
              result.complete
                ? "border-[#B6E3C8] bg-[#EDFBF3] dark:border-[#27543E] dark:bg-[#12352A]"
                : "border-[#F0D79E] bg-[#FFF7E6] dark:border-[#5E4718] dark:bg-[#3A2C10]"
            }`}
          >
            <div className="flex items-center gap-3">
              {result.complete ? (
                <Trophy className="h-8 w-8 text-[#186B47] dark:text-[#8FE3B4]" />
              ) : (
                <RotateCcw className="h-8 w-8 text-[#8A5B0B] dark:text-[#F5CE83]" />
              )}
              <div>
                <p className="text-[19px] font-extrabold">
                  {result.complete
                    ? t("routine.successMessage", "Wonderful work!")
                    : t("routine.tryAgainMessage", "Almost there — try again.")}
                </p>
                <p className="text-[16px] font-semibold">
                  {result.complete && level > routine.difficulty
                    ? t(
                        "routine.nextLevelReady",
                        "Level {{level}} is ready for your next round. ",
                        { level },
                      )
                    : ""}
                  {t(
                    "routine.accuracyMessage",
                    "You placed {{accuracy}}% of the activities in the right spot.",
                    { accuracy: result.accuracy },
                  )}
                </p>
              </div>
            </div>
            {result.complete ? (
              <button
                type="button"
                onClick={reset}
                className="tap-target mt-3 gap-2 rounded-xl border-2 border-[#B6E3C8] px-4 text-[15px] font-extrabold text-[#186B47] dark:border-[#27543E] dark:text-[#8FE3B4]"
              >
                <RotateCcw size={17} />{" "}
                {t("routine.playNextRound", "Play the next round")}
              </button>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  )
}

export function DailyRoutine() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { routines, isLoading, update } = useRoutines(DEFAULT_PATIENT.id, false)
  const activeRoutines = routines.length ? routines : [fallbackRoutine()]
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = activeRoutines.find((routine) => routine.id === selectedId)
  if (selected)
    return (
      <RoutineGame
        routine={selected}
        onBack={() => setSelectedId(null)}
        onLevelUp={(difficulty) => {
          if (routines.some((routine) => routine.id === selected.id))
            void update(selected.id, {
              name: selected.name,
              description: selected.description,
              category: selected.category,
              difficulty,
              active: selected.active,
              steps: selected.steps,
            })
        }}
      />
    )
  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={() => navigate("/")}
        className="gap-2 text-[18px] font-bold"
        style={{ color: "var(--muted-strong)" }}
      >
        <ChevronLeft size={18} /> {t("navigation.backToGames", "Back to Games")}
      </button>
      <header className="flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-2xl border-2 border-[#B6E3C8] bg-[#EDFBF3] text-2xl dark:border-[#27543E] dark:bg-[#12352A]">
          📋
        </span>
        <div>
          <h1 className="text-2xl font-extrabold">
            {t("routine.title", "Daily Routine")}
          </h1>
          <p
            className="text-[17px] font-semibold"
            style={{ color: "var(--muted-strong)" }}
          >
            {t(
              "routine.subtitle",
              "Choose a routine to practise putting activities in order.",
            )}
          </p>
        </div>
      </header>
      {isLoading ? (
        <p
          className="text-[17px] font-semibold"
          style={{ color: "var(--muted)" }}
        >
          {t("routine.loading", "Loading your routines…")}
        </p>
      ) : (
        <section
          aria-label={t("routine.chooseRoutineAria", "Choose a routine")}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          {activeRoutines.map((routine) => {
            const count = stepsForDifficulty(routine).length
            return (
              <article
                key={routine.id}
                className="rounded-3xl border-2 border-[#B6E3C8] bg-[#EDFBF3] p-5 shadow-sm dark:border-[#27543E] dark:bg-[#12352A]"
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl">
                    {routine.category === "morning"
                      ? "🌅"
                      : routine.category === "evening" ||
                          routine.category === "bedtime"
                        ? "🌙"
                        : "📋"}
                  </span>
                  <div>
                    <h2 className="text-[20px] font-extrabold text-[#0F6E56] dark:text-[#8FE3C8]">
                      {t(`routines.${routine.id}.name`, routine.name)}
                    </h2>
                    <p className="text-[16px] font-bold text-[#186B47] dark:text-[#8FE3B4]">
                      {t("routine.activitiesCount", "{{count}} activities", {
                        count,
                      })}{" "}
                      ·{" "}
                      {t(
                        `routineCategory.${routine.category}`,
                        categoryLabel(routine.category),
                      )}
                    </p>
                  </div>
                </div>
                {routine.description ? (
                  <p
                    className="mt-3 text-[15px] font-semibold"
                    style={{ color: "var(--muted-strong)" }}
                  >
                    {t(
                      `routines.${routine.id}.description`,
                      routine.description,
                    )}
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={() => setSelectedId(routine.id)}
                  className="tap-target mt-5 w-full gap-2 rounded-2xl bg-[#0F6E56] px-5 text-[17px] font-extrabold text-white"
                >
                  <ListChecks size={20} /> {t("routine.start", "Start")}
                </button>
              </article>
            )
          })}
        </section>
      )}
    </div>
  )
}
export default DailyRoutine
