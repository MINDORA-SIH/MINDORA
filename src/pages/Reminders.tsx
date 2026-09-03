import { useState, useRef, useEffect } from "react";
import {
  Pill, Droplets, Calendar, ClipboardList,
  Plus, CheckCircle2, X, Clock, RefreshCw,
} from "lucide-react";

type Frequency = "daily" | "weekly" | "monthly";
type IconName  = "pill" | "droplets" | "clipboard" | "calendar";

interface Reminder {
  id: number;
  title: string;
  time: string;
  frequency: Frequency;
  iconName: IconName;
  removing: boolean;
}

interface ToastAlert {
  id: number;
  title: string;
  visible: boolean;
}

/* ── Icon helper ── */
function ReminderIcon({ name }: { name: IconName }) {
  if (name === "pill")      return <Pill      size={36} className="text-rose-pink" />;
  if (name === "droplets")  return <Droplets  size={36} className="text-sky-blue"  />;
  if (name === "clipboard") return <ClipboardList size={36} className="text-lavender" />;
  return                           <Calendar  size={36} className="text-rose-pink" />;
}

/* ── Frequency badge ── */
const FREQ_STYLES: Record<Frequency, { label: string; bg: string; text: string }> = {
  daily:   { label: "Daily",   bg: "rgba(255,255,255,0.45)", text: "#1a6640" },
  weekly:  { label: "Weekly",  bg: "rgba(255,255,255,0.45)", text: "#1a5066" },
  monthly: { label: "Monthly", bg: "rgba(255,255,255,0.45)", text: "#5c3d99" },
};

function FreqBadge({ freq }: { freq: Frequency }) {
  const s = FREQ_STYLES[freq];
  return (
    <span
      className="inline-flex items-center gap-1 text-[18px] font-bold px-2 py-0.5 rounded-full mt-1"
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      <RefreshCw size={11} />
      {s.label}
    </span>
  );
}

/* ── Default icon for new reminders (cycle) ── */
const ICON_CYCLE: IconName[] = ["pill", "droplets", "clipboard", "calendar"];

/* ═══════════════════════════════════════════════════════════ */
export function Reminders() {
  const [hoveredId, setHoveredId]   = useState<number | null>(null);
  const [showModal,  setShowModal]  = useState(false);
  const [toasts,     setToasts]     = useState<ToastAlert[]>([]);

  /* ── Reminder list ── */
  const [reminders, setReminders] = useState<Reminder[]>([
    { id: 1, title: "Morning Pills", time: "08:00 AM",            frequency: "daily",   iconName: "pill",      removing: false },
    { id: 2, title: "Drink Water",   time: "10:30 AM",            frequency: "daily",   iconName: "droplets",  removing: false },
    { id: 3, title: "Garden Walk",   time: "04:00 PM",            frequency: "weekly",  iconName: "clipboard", removing: false },
    { id: 4, title: "Doctor Visit",  time: "02:00 PM (Tomorrow)", frequency: "monthly", iconName: "calendar",  removing: false },
  ]);

  /* ── New-reminder form state ── */
  const [form, setForm] = useState<{ title: string; time: string; frequency: Frequency }>({
    title: "",
    time: "",
    frequency: "daily",
  });
  const titleRef = useRef<HTMLInputElement>(null);

  /* Focus name input when modal opens */
  useEffect(() => {
    if (showModal) setTimeout(() => titleRef.current?.focus(), 80);
  }, [showModal]);

  /* ── Toast helpers ── */
  const dismissToast = (toastId: number) => {
    setToasts((prev) => prev.map((t) => (t.id === toastId ? { ...t, visible: false } : t)));
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== toastId)), 400);
  };

  const fireToast = (message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, title: message, visible: true }]);
    setTimeout(() => dismissToast(id), 4000);
  };

  /* ── Mark done → animate out → remove ── */
  const markDone = (id: number) => {
    const r = reminders.find((r) => r.id === id);
    if (!r) return;
    fireToast(`${r.title} — completed for today! 🎉`);
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, removing: true } : r)));
    setTimeout(() => setReminders((prev) => prev.filter((r) => r.id !== id)), 500);
  };

  /* ── Add new reminder ── */
  const handleAdd = () => {
    if (!form.title.trim() || !form.time.trim()) return;
    const iconIdx = reminders.length % ICON_CYCLE.length;

    // Format time from "HH:MM" to "HH:MM AM/PM"
    const [hStr, mStr] = form.time.split(":");
    const h = parseInt(hStr, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12  = h % 12 || 12;
    const displayTime = `${String(h12).padStart(2, "0")}:${mStr} ${ampm}`;

    const newReminder: Reminder = {
      id: Date.now(),
      title: form.title.trim(),
      time: displayTime,
      frequency: form.frequency,
      iconName: ICON_CYCLE[iconIdx],
      removing: false,
    };
    setReminders((prev) => [...prev, newReminder]);
    setForm({ title: "", time: "", frequency: "daily" });
    setShowModal(false);
    fireToast(`"${newReminder.title}" reminder added! ✅`);
  };

  /* ═══════════════════════════════════════════════════════════ */
  return (
    <div className="space-y-8 max-w-3xl mx-auto animate-in fade-in duration-500">

      {/* ══ Toast Stack ══ */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              transition: "opacity 0.4s ease, transform 0.4s ease",
              opacity:   toast.visible ? 1 : 0,
              transform: toast.visible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.95)",
              pointerEvents: "all",
            }}
            className="flex items-center gap-4 bg-white border-2 border-green-200 shadow-2xl rounded-2xl px-5 py-4 min-w-[280px] max-w-sm"
          >
            <div className="relative flex-shrink-0">
              <CheckCircle2 size={30} className="text-emerald-500" />
              <span className="absolute inset-0 rounded-full bg-emerald-300 animate-ping opacity-40" style={{ animationDuration: "1.2s" }} />
            </div>
            <p className="flex-1 text-base font-semibold text-charcoal leading-snug">{toast.title}</p>
            <button onClick={() => dismissToast(toast.id)} className="flex-shrink-0 text-charcoal/40 hover:text-charcoal/80 transition-colors" aria-label="Dismiss">
              <X size={18} />
            </button>
          </div>
        ))}
      </div>

      {/* ══ Add New Modal ══ */}
      {showModal && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 flex flex-col gap-6"
            style={{ animation: "modalIn 0.3s cubic-bezier(0.34,1.56,0.64,1)" }}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-extrabold text-charcoal">New Reminder</h2>
              <button onClick={() => setShowModal(false)} className="text-charcoal/40 hover:text-charcoal transition-colors" aria-label="Close">
                <X size={24} />
              </button>
            </div>

            {/* ① Reminder name */}
            <div className="flex flex-col gap-2">
              <label className="text-[20px] font-bold text-charcoal/70 tracking-widest">
                Reminder Name
              </label>
              <input
                ref={titleRef}
                type="text"
                placeholder="e.g. Take Vitamins"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full rounded-2xl border-2 border-lavender/40 px-4 py-3 text-lg font-semibold text-charcoal outline-none focus:border-[#9BE5AA] transition-colors"
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
            </div>

            {/* ② Time */}
            <div className="flex flex-col gap-2">
              <label className="text-[20px] font-bold text-charcoal/70 tracking-widest flex items-center gap-1">
                <Clock size={14} /> Time
              </label>
              <input
                type="time"
                value={form.time}
                onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                className="w-full rounded-2xl border-2 border-lavender/40 px-4 py-3 text-lg font-semibold text-charcoal outline-none focus:border-[#9BE5AA] transition-colors"
              />
            </div>

            {/* ③ Frequency */}
            <div className="flex flex-col gap-2">
              <label className="text-[20px] font-bold text-charcoal/70 tracking-widest flex items-center gap-1">
                <RefreshCw size={14} /> Repeat
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(["daily", "weekly", "monthly"] as Frequency[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setForm((prev) => ({ ...prev, frequency: f }))}
                    className="py-3 rounded-2xl text-base font-bold border-2 transition-all duration-200 capitalize"
                    style={
                      form.frequency === f
                        ? { backgroundColor: "#9BE5AA", borderColor: "#2d6a4f", color: "#1a3d2b" }
                        : { backgroundColor: "transparent", borderColor: "#e0e0e0", color: "#888" }
                    }
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-2xl border-2 border-charcoal/15 text-charcoal/60 font-bold text-lg hover:bg-charcoal/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={!form.title.trim() || !form.time.trim()}
                className="flex-1 py-3 rounded-2xl text-charcoal font-bold text-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                style={{ backgroundColor: "#9BE5AA" }}
              >
                Add Reminder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ Header ══ */}
      <header className="pt-4 pb-2 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-charcoal mb-2">Daily Reminders</h1>
          <p className="text-2xl text-charcoal/80 font-medium">Your schedule for today.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-rose-pink hover:bg-rose-pink/80 active:scale-95 text-charcoal py-4 px-6 rounded-2xl font-bold text-xl flex items-center gap-3 transition-all tap-target shadow-sm"
        >
          <Plus size={28} />
          Add New
        </button>
      </header>

      {/* ══ Reminder Cards ══ */}
      <div className="flex flex-col gap-5">
        {reminders.map((reminder) => (
          <div
            key={reminder.id}
            onMouseEnter={() => !reminder.removing && setHoveredId(reminder.id)}
            onMouseLeave={() => setHoveredId(null)}
            className="flex items-center gap-5 rounded-3xl border-4 cursor-pointer border-transparent overflow-hidden"
            style={{
              backgroundColor: "#9BE5AA",
              borderColor: "#9BE5AA",
              transform: reminder.removing
                ? "translateX(120%) scale(0.9)"
                : hoveredId === reminder.id
                ? "scale(0.97)"
                : "scale(1)",
              opacity:   reminder.removing ? 0 : 1,
              maxHeight: reminder.removing ? "0px" : "200px",
              padding:   reminder.removing ? "0 1.25rem" : "1.25rem",
              marginBottom: reminder.removing ? "-1.25rem" : undefined,
              boxShadow:
                !reminder.removing && hoveredId === reminder.id
                  ? "0 0 0 1px #2d6a4f, 0 6px 20px rgba(45,106,79,0.3)"
                  : "none",
              transition:
                "transform 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.5s ease, max-height 0.5s ease, margin 0.5s ease, padding 0.5s ease, box-shadow 0.2s ease",
            }}
          >
            {/* Icon bubble */}
            <div className="p-3 rounded-full flex-shrink-0" style={{ backgroundColor: "rgba(255,255,255,0.38)" }}>
              <ReminderIcon name={reminder.iconName} />
            </div>

            {/* Title, time & frequency badge */}
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-charcoal truncate">{reminder.title}</h3>
              <p className="text-base text-charcoal/70">{reminder.time}</p>
              <FreqBadge freq={reminder.frequency} />
            </div>

            {/* Done button */}
            <button
              onClick={() => markDone(reminder.id)}
              aria-label="Mark as done"
              disabled={reminder.removing}
              className="w-14 h-14 rounded-full border-4 bg-white border-white flex items-center justify-center transition-all duration-200 tap-target active:scale-90 hover:bg-green-100 flex-shrink-0"
            />
          </div>
        ))}

        {/* Empty state */}
        {reminders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-charcoal/50">
            <CheckCircle2 size={64} className="text-emerald-400" />
            <p className="text-2xl font-bold">All done for today! 🎉</p>
            <p className="text-lg">You completed all your reminders.</p>
          </div>
        )}
      </div>

      {/* Modal enter animation */}
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.88) translateY(24px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);     }
        }
      `}</style>
    </div>
  );
}
