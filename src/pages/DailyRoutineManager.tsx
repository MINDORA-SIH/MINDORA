import { DndContext, KeyboardSensor, PointerSensor, TouchSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Check, ChevronDown, ChevronUp, GripVertical, Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { SectionCard, StatTile, StatusPill } from "@/components/dashboard/ui";
import { getRoutineSessions } from "@/data/routineRepository";
import { DEFAULT_PATIENT, PREDEFINED_ACTIVITIES, categoryLabel, type Routine, type RoutineDraft, type RoutineStep, ROUTINE_CATEGORIES } from "@/data/routineTypes";
import { useRoutines } from "@/hooks/useRoutines";

const FIELD = "tap-target w-full rounded-2xl border-2 border-slate-200 px-4 py-2.5 text-[16px] font-semibold outline-none focus-visible:border-[#6C5CC4] dark:border-slate-700";
const EMPTY_DRAFT: RoutineDraft = { name: "", description: "", category: "morning", difficulty: 2, active: true, steps: [] };
type EditorState = { routine?: Routine } | null;

export const ACTIVITY_KEY_MAP: Record<string, string> = {
  "Wake up": "wakeUp",
  "Brush teeth": "brushTeeth",
  "Take medicine": "takeMedicine",
  "Drink water": "drinkWater",
  "Eat breakfast": "eatBreakfast",
  "Take a bath": "takeBath",
  "Get dressed": "getDressed",
  "Read newspaper": "readNewspaper",
  "Go for a walk": "goForAWalk",
  "Have lunch": "haveLunch",
  "Rest": "rest",
  "Exercise": "exercise",
  "Talk with family": "talkWithFamily",
  "Dinner": "dinner",
  "Prepare for bed": "prepareForBed",
  "Go to sleep": "goToSleep",
};

function stepFrom(title: string, icon = "✅"): RoutineStep {
  return { id: `routine-step-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, title, icon, enabled: true, order: 0 };
}

function SortableStep({ step, index, count, onChange, onRemove, onMove }: { step: RoutineStep; index: number; count: number; onChange: (step: RoutineStep) => void; onRemove: () => void; onMove: (direction: -1 | 1) => void }) {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: step.id });
  return (
    <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={`rounded-2xl border-2 p-3 ${isDragging ? "border-[#6C5CC4] bg-[#F5F2FF] shadow-lg dark:bg-[#251F3D]" : "border-slate-200 dark:border-slate-700"}`}>
      <div className="flex items-start gap-2">
        <button type="button" className="tap-target shrink-0 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700" aria-label={t("dailyRoutine.drag", { name: step.title })} {...attributes} {...listeners}><GripVertical /></button>
        <span className="pt-2 text-[18px] font-extrabold" aria-hidden="true">{index + 1}</span>
        <input aria-label={`Activity ${index + 1} name`} value={step.title} onChange={(event) => onChange({ ...step, title: event.target.value })} className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-[16px] font-bold dark:border-slate-700" />
        <input aria-label={`${step.title} icon`} value={step.icon ?? ""} onChange={(event) => onChange({ ...step, icon: event.target.value })} className="w-14 rounded-xl border border-slate-200 px-2 py-2 text-center text-[18px] dark:border-slate-700" />
      </div>
      <div className="ml-12 mt-2 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => onMove(-1)} disabled={index === 0} className="tap-target rounded-xl border border-slate-200 px-3 text-[14px] font-extrabold disabled:opacity-40 dark:border-slate-700" aria-label={t("dailyRoutine.moveUpItem", { name: step.title })}><ChevronUp size={18} /> {t("dailyRoutine.moveUp")}</button>
        <button type="button" onClick={() => onMove(1)} disabled={index === count - 1} className="tap-target rounded-xl border border-slate-200 px-3 text-[14px] font-extrabold disabled:opacity-40 dark:border-slate-700" aria-label={t("dailyRoutine.moveDownItem", { name: step.title })}><ChevronDown size={18} /> {t("dailyRoutine.moveDown")}</button>
        <button type="button" onClick={onRemove} className="tap-target ml-auto gap-1 rounded-xl border border-[#F0BDBD] bg-[#FDEEEE] px-3 text-[14px] font-extrabold text-[#A32E2E] dark:border-[#6B2B2B] dark:bg-[#3B1A1A] dark:text-[#F6A5A5]"><Trash2 size={16} /> {t("dailyRoutine.remove")}</button>
      </div>
    </li>
  );
}

function RoutineEditor({ routine, onCancel, onSave }: { routine?: Routine; onCancel: () => void; onSave: (draft: RoutineDraft) => Promise<void> }) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<RoutineDraft>(() => routine ? { name: routine.name, description: routine.description, category: routine.category, difficulty: routine.difficulty, active: routine.active, steps: routine.steps } : EMPTY_DRAFT);
  const [customTitle, setCustomTitle] = useState(""); const [customIcon, setCustomIcon] = useState("✨"); const [error, setError] = useState<string | null>(null); const [saving, setSaving] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  useEffect(() => { nameRef.current?.focus(); }, []);
  const steps = draft.steps.map((step, index) => ({ ...step, order: index + 1 }));
  const setSteps = (next: RoutineStep[]) => setDraft((current) => ({ ...current, steps: next.map((step, index) => ({ ...step, order: index + 1 })) }));
  const addStep = (title: string, icon?: string) => { if (!title.trim()) return; setSteps([...steps, stepFrom(title.trim(), icon)]); };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.name.trim()) { setError(t("dailyRoutine.errorName")); nameRef.current?.focus(); return; }
    if (steps.length === 0) { setError(t("dailyRoutine.errorAtLeastOne")); return; }
    if (steps.some((step) => !step.title.trim())) { setError(t("dailyRoutine.errorEveryActivity")); return; }
    setSaving(true);
    try { await onSave({ ...draft, steps }); } catch { setError(t("dailyRoutine.errorSave")); setSaving(false); }
  };
  return (
    <div className="fixed inset-0 z-[150] flex items-end justify-center bg-slate-900/40 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={() => !saving && onCancel()}>
      <div role="dialog" aria-modal="true" aria-labelledby="routine-editor-title" onClick={(event) => event.stopPropagation()} className="max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-t-3xl border-2 border-slate-200 shadow-2xl sm:rounded-3xl dark:border-slate-700" style={{ backgroundColor: "var(--card-bg)" }}>
        <form onSubmit={submit} className="space-y-5 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id="routine-editor-title" className="text-2xl font-extrabold">{routine ? t("dailyRoutine.editRoutine") : t("dailyRoutine.createRoutine")}</h2>
              <p className="text-[15px] font-semibold" style={{ color: "var(--muted)" }}>{t("dailyRoutine.putInOrder")}</p>
            </div>
            <button type="button" onClick={onCancel} aria-label={t("common.close")} className="tap-target rounded-full"><X /></button>
          </div>
          <section className="grid gap-4 rounded-2xl border-2 border-slate-200 p-4 sm:grid-cols-2 dark:border-slate-700">
            <label className="space-y-1.5">
              <span className="text-[15px] font-extrabold">{t("dailyRoutine.routineName")}</span>
              <input ref={nameRef} value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder={t("dailyRoutine.routineNamePlaceholder", { defaultValue: "Morning Routine" })} className={FIELD} />
            </label>
            <label className="space-y-1.5">
              <span className="text-[15px] font-extrabold">{t("dailyRoutine.timeOfDay")}</span>
              <select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value as RoutineDraft["category"] })} className={FIELD}>
                {ROUTINE_CATEGORIES.map((category) => <option key={category} value={category}>{t(`categories.${category}`, { defaultValue: categoryLabel(category) })}</option>)}
              </select>
            </label>
          </section>
          <section className="space-y-3 rounded-2xl border-2 border-slate-200 p-4 dark:border-slate-700">
            <div>
              <h3 className="text-[18px] font-extrabold">{t("dailyRoutine.activitiesInOrder")}</h3>
              <p className="text-[14px] font-semibold" style={{ color: "var(--muted)" }}>{t("dailyRoutine.gameInstructions")}</p>
            </div>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={({ active, over }) => { if (over && active.id !== over.id) { const oldIndex = steps.findIndex((step) => step.id === active.id); const newIndex = steps.findIndex((step) => step.id === over.id); setSteps(arrayMove(steps, oldIndex, newIndex)); } }}>
              <SortableContext items={steps.map((step) => step.id)} strategy={verticalListSortingStrategy}>
                <ul className="space-y-2">{steps.map((step, index) => <SortableStep key={step.id} step={step} index={index} count={steps.length} onChange={(next) => setSteps(steps.map((current) => current.id === next.id ? next : current))} onRemove={() => setSteps(steps.filter((current) => current.id !== step.id))} onMove={(direction) => setSteps(arrayMove(steps, index, index + direction))} />)}</ul>
              </SortableContext>
            </DndContext>
          </section>
          <section className="rounded-2xl border-2 border-[#D6CBF5] bg-[#F5F2FF] p-4 dark:border-[#44386B] dark:bg-[#251F3D]">
            <h3 className="text-[18px] font-extrabold text-[#5044A8] dark:text-[#C4B5FD]">{t("dailyRoutine.addActivities")}</h3>
            <div className="mt-3 flex flex-wrap gap-2">{PREDEFINED_ACTIVITIES.map(([title, icon]) => <button key={title} type="button" onClick={() => addStep(title, icon)} className="min-h-10 rounded-xl border border-[#D6CBF5] bg-white px-3 text-[14px] font-bold text-[#5044A8] hover:bg-[#EEE9FF] dark:border-[#44386B] dark:bg-slate-800 dark:text-[#C4B5FD] cursor-pointer">{icon} {t(`activities.${ACTIVITY_KEY_MAP[title] ?? title}`, { defaultValue: title })}</button>)}</div>
            <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_80px_auto]">
              <input value={customTitle} onChange={(event) => setCustomTitle(event.target.value)} placeholder={t("dailyRoutine.addCustomActivityPlaceholder", { defaultValue: "Add a custom activity" })} className="rounded-xl border border-[#D6CBF5] bg-white px-3 py-2 text-[15px] font-semibold dark:border-[#44386B] dark:bg-slate-800" />
              <input value={customIcon} onChange={(event) => setCustomIcon(event.target.value)} aria-label="Custom activity icon" className="rounded-xl border border-[#D6CBF5] bg-white px-3 py-2 text-center text-[18px] dark:border-[#44386B] dark:bg-slate-800" />
              <button type="button" onClick={() => { addStep(customTitle, customIcon); setCustomTitle(""); }} className="tap-target gap-2 rounded-xl bg-[#6C5CC4] px-4 text-[15px] font-extrabold text-white cursor-pointer"><Plus size={18} /> {t("common.add")}</button>
            </div>
          </section>
          {error ? <p role="alert" className="rounded-2xl border-2 border-[#F0BDBD] bg-[#FDEEEE] px-4 py-3 text-[15px] font-bold text-[#A32E2E]">{error}</p> : null}
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onCancel} disabled={saving} className="tap-target rounded-2xl border-2 border-slate-200 px-5 text-[16px] font-extrabold dark:border-slate-700 cursor-pointer">{t("common.cancel")}</button>
            <button type="submit" disabled={saving} className="tap-target gap-2 rounded-2xl bg-[#6C5CC4] px-6 text-[16px] font-extrabold text-white cursor-pointer"><Check size={18} /> {saving ? t("dailyRoutine.saving") : t("dailyRoutine.saveRoutine")}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RoutinePerformance({ routine }: { routine: Routine }) {
  const { t } = useTranslation();
  const [sessions, setSessions] = useState<Awaited<ReturnType<typeof getRoutineSessions>>>([]);
  useEffect(() => { void getRoutineSessions(routine.patientId, routine.id).then(setSessions); }, [routine.id, routine.patientId]);
  const completed = sessions.filter((session) => session.completedAt);
  const accuracy = completed.length ? Math.round(completed.reduce((sum, session) => sum + session.accuracy, 0) / completed.length) : 0;
  const averageTime = completed.length ? Math.round(completed.reduce((sum, session) => sum + session.completionTimeMs, 0) / completed.length / 1000) : 0;
  const hints = completed.length ? Math.round(completed.reduce((sum, session) => sum + session.hintsUsed, 0) / completed.length) : 0;

  return (
    <div className="mt-3 rounded-2xl border border-[#C3DEF7] bg-[#F1F7FE] p-4 dark:border-[#2C4562] dark:bg-[#17293D]">
      <h3 className="text-[17px] font-extrabold text-[#185FA5] dark:text-[#9FD0FF]">{t("dailyRoutine.routinePerformance")}</h3>
      <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatTile label={t("dailyRoutine.accuracy")} value={completed.length ? `${accuracy}%` : "—"} tone="info" />
        <StatTile label={t("dailyRoutine.averageTime")} value={completed.length ? `${averageTime} sec` : "—"} tone="info" />
        <StatTile label={t("dailyRoutine.hints")} value={completed.length ? `${hints}` : "—"} tone="info" />
        <StatTile label={t("dailyRoutine.attempts")} value={`${completed.length}`} tone="info" />
      </dl>
      {completed.length ? (
        <ul className="mt-3 space-y-1 text-[14px] font-semibold" style={{ color: "var(--muted-strong)" }}>
          {completed.slice(0, 4).map((session) => <li key={session.id}>{new Date(session.startedAt).toLocaleDateString()} — {Math.round(session.accuracy)}%</li>)}
        </ul>
      ) : (
        <p className="mt-2 text-[14px] font-semibold" style={{ color: "var(--muted-strong)" }}>{t("dailyRoutine.noCompleted")}</p>
      )}
    </div>
  );
}

export function DailyRoutineManager({ embedded = false }: { embedded?: boolean }) {
  const { t } = useTranslation();
  const { routines, isLoading, storageAvailable, create, update, remove } = useRoutines(DEFAULT_PATIENT.id);
  const [editor, setEditor] = useState<EditorState>(null);
  const [viewing, setViewing] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Routine | null>(null);

  const save = async (draft: RoutineDraft) => {
    if (editor?.routine) await update(editor.routine.id, draft);
    else await create(draft);
    setEditor(null);
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          {embedded ? <h2 className="text-2xl font-extrabold sm:text-3xl">{t("dailyRoutine.title")}</h2> : <h1 className="text-2xl font-extrabold sm:text-3xl">{t("dailyRoutine.title")}</h1>}
          <p className="text-[17px] font-semibold" style={{ color: "var(--muted-strong)" }}>{t("dailyRoutine.subtitle")}</p>
        </div>
        <button type="button" onClick={() => setEditor({})} className="tap-target gap-2 rounded-2xl bg-[#6C5CC4] px-5 text-[16px] font-extrabold text-white shadow-md cursor-pointer">
          <Plus size={20} /> {t("dailyRoutine.addRoutine")}
        </button>
      </header>

      <SectionCard title={t("navigation.patient")} subtitle={t("dailyRoutine.patientSubtitle")} action={<StatusPill label={t("dailyRoutine.savedOnDevice")} tone="neutral" />}>
        <select aria-label={t("navigation.patient")} value={DEFAULT_PATIENT.id} className={`${FIELD} max-w-md`}>
          <option value={DEFAULT_PATIENT.id}>{DEFAULT_PATIENT.name}</option>
        </select>
        {!storageAvailable ? <p className="mt-3 text-[15px] font-semibold text-[#8A5B0B]">{t("dailyRoutine.deviceCannotSave")}</p> : null}
      </SectionCard>

      <SectionCard title={t("dailyRoutine.existingRoutines")} subtitle={t("dailyRoutine.patientSubtitle")}>
        {isLoading ? (
          <p className="text-[16px] font-semibold" style={{ color: "var(--muted)" }}>{t("dailyRoutine.loadingRoutines")}</p>
        ) : routines.length === 0 ? (
          <p className="text-[16px] font-semibold" style={{ color: "var(--muted)" }}>{t("dailyRoutine.noCompleted")}</p>
        ) : (
          <ul className="space-y-3">
            {routines.map((routine) => (
              <li key={routine.id} className="rounded-2xl border-2 border-slate-200 p-4 dark:border-slate-700">
                <div className="flex flex-wrap items-start gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl border border-[#B6E3C8] bg-[#EDFBF3] text-xl dark:border-[#27543E] dark:bg-[#12352A]">
                    {routine.category === "morning" ? "🌅" : routine.category === "evening" || routine.category === "bedtime" ? "🌙" : "✅"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-[18px] font-extrabold">{routine.name}</h2>
                    <p className="text-[15px] font-semibold" style={{ color: "var(--muted-strong)" }}>
                      {t("dailyRoutine.activityCount", { count: routine.steps.length })} · {t(`categories.${routine.category}`, { defaultValue: categoryLabel(routine.category) })} · {t("dailyRoutine.levelAndSteps", { level: routine.difficulty, count: routine.steps.length })}
                    </p>
                    {routine.description ? <p className="mt-1 text-[14px] font-semibold" style={{ color: "var(--muted)" }}>{routine.description}</p> : null}
                  </div>
                  <StatusPill label={routine.active ? t("dailyRoutine.active") : t("dailyRoutine.inactive")} tone={routine.active ? "stable" : "neutral"} />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" onClick={() => setViewing(viewing === routine.id ? null : routine.id)} className="tap-target rounded-xl border-2 border-slate-200 px-4 text-[15px] font-extrabold dark:border-slate-700 cursor-pointer">
                    {viewing === routine.id ? t("common.hide") : t("common.view")}
                  </button>
                  <button type="button" onClick={() => setEditor({ routine })} className="tap-target gap-1.5 rounded-xl border-2 border-[#D6CBF5] bg-[#F5F2FF] px-4 text-[15px] font-extrabold text-[#5044A8] dark:border-[#44386B] dark:bg-[#251F3D] dark:text-[#C4B5FD] cursor-pointer">
                    <Pencil size={16} /> {t("common.edit")}
                  </button>
                  <button type="button" onClick={() => setDeleteTarget(routine)} className="tap-target gap-1.5 rounded-xl border-2 border-[#F0BDBD] bg-[#FDEEEE] px-4 text-[15px] font-extrabold text-[#A32E2E] dark:border-[#6B2B2B] dark:bg-[#3B1A1A] dark:text-[#F6A5A5] cursor-pointer">
                    <Trash2 size={16} /> {t("common.delete")}
                  </button>
                </div>
                {viewing === routine.id ? <RoutinePerformance routine={routine} /> : null}
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      {editor ? <RoutineEditor routine={editor.routine} onCancel={() => setEditor(null)} onSave={save} /> : null}

      {deleteTarget ? (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div role="dialog" aria-modal="true" aria-labelledby="delete-routine-title" className="w-full max-w-md rounded-3xl border-2 border-slate-200 p-6 shadow-2xl dark:border-slate-700" style={{ backgroundColor: "var(--card-bg)" }}>
            <h2 id="delete-routine-title" className="text-xl font-extrabold">{t("dailyRoutine.deleteTitle", { name: deleteTarget.name })}</h2>
            <p className="mt-2 text-[16px] font-semibold" style={{ color: "var(--muted-strong)" }}>{t("dailyRoutine.deleteSubtitle")}</p>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setDeleteTarget(null)} className="tap-target rounded-2xl border-2 border-slate-200 px-5 text-[16px] font-extrabold dark:border-slate-700 cursor-pointer">{t("common.cancel")}</button>
              <button type="button" onClick={() => void remove(deleteTarget.id).then(() => setDeleteTarget(null))} className="tap-target rounded-2xl bg-[#C93A3A] px-5 text-[16px] font-extrabold text-white cursor-pointer">{t("common.delete")}</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default DailyRoutineManager;
