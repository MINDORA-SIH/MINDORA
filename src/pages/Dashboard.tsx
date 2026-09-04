import { type ReactNode, useState } from "react";
import { useNavigate } from "react-router";
import {
  BrainCircuit,
  CalendarDays,
  Check,
  Eye,
  FileText,
  Flame,
  Gamepad2,
  LayoutGrid,
  ListCheck,
  Music,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  dashboardData,
  getDashboardInsights,
  type CalendarDay,
  type GameScore,
} from "../data/dashboardData";

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const scoreBarColors = ["bg-rose-pink", "bg-sky-blue", "bg-lavender", "bg-[#81B29A]", "bg-[#E9A66A]", "bg-[#A78BFA]", "bg-[#6FA3D8]"];

const gameIcons = {
  users: Users,
  "file-text": FileText,
  eye: Eye,
  grid: LayoutGrid,
  music: Music,
  "list-check": ListCheck,
};

const gameAccentStyles: Record<GameScore["accent"], { icon: string; bar: string }> = {
  rose: { icon: "bg-[#FAECE7] text-[#993C1D]", bar: "bg-[#D67858]" },
  sky: { icon: "bg-[#E6F1FB] text-[#185FA5]", bar: "bg-[#5B9BD5]" },
  violet: { icon: "bg-[#EEEDFE] text-[#534AB7]", bar: "bg-[#7B6BC4]" },
  amber: { icon: "bg-[#FAEEDA] text-[#854F0B]", bar: "bg-[#C68A35]" },
  green: { icon: "bg-[#EAF3DE] text-[#3B6D11]", bar: "bg-[#74A64B]" },
  teal: { icon: "bg-[#E1F5EE] text-[#0F6E56]", bar: "bg-[#3D9A7D]" },
};

function SummaryCard({ icon, label, value, supportingText, tone, primary = false }: {
  icon: ReactNode;
  label: string;
  value: string;
  supportingText: string;
  tone: "rose" | "violet" | "sky" | "green";
  primary?: boolean;
}) {
  const tones = {
    rose: "border-[#F3C4D3] bg-[#FFF4F7] text-[#993C1D]",
    violet: "border-[#D8CEF2] bg-[#F7F4FF] text-[#534AB7]",
    sky: "border-[#C7E2F8] bg-[#F2F9FF] text-[#185FA5]",
    green: "border-[#CAE8CF] bg-[#F1FAF3] text-[#247447]",
  };

  return (
    <section className={`min-h-[132px] rounded-3xl border-2 p-4 sm:p-5 shadow-sm ${tones[tone]} ${primary ? "ring-2 ring-[#CDB4DB]/35" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm sm:text-base font-extrabold leading-tight">{label}</p>
        <span className="rounded-xl bg-white/80 p-2 shadow-xs" aria-hidden="true">{icon}</span>
      </div>
      <p className={`mt-3 font-black tracking-tight leading-none ${primary ? "text-3xl sm:text-4xl" : "text-3xl"}`}>{value}</p>
      <p className="mt-2 text-sm sm:text-base font-bold opacity-80">{supportingText}</p>
    </section>
  );
}

function ActivityCalendar({ selectedDay, onSelect }: { selectedDay: CalendarDay; onSelect: (day: CalendarDay) => void }) {
  const { calendar } = dashboardData;
  const selectedSession = selectedDay.session;

  const statusClasses = {
    completed: "border-emerald-300 bg-emerald-100 text-emerald-900 hover:bg-emerald-200",
    missed: "border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100",
    today: "border-2 border-sky-500 bg-white text-sky-800 hover:bg-sky-50 dark:bg-slate-800 dark:text-sky-200",
  };

  const statusLabel = {
    completed: "Completed",
    missed: "Missed",
    today: "Today",
  };

  return (
    <section className="rounded-3xl border-2 border-pale-sky/60 p-5 sm:p-6 shadow-sm" style={{ backgroundColor: "var(--card-bg)" }}>
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-pale-sky/50 p-2 text-[#185FA5]">
          <CalendarDays size={24} aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold" style={{ color: "var(--foreground)" }}>Activity Calendar</h2>
          <p className="text-sm sm:text-base font-semibold" style={{ color: "var(--muted)" }}>{calendar.month} {calendar.year}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm font-bold" style={{ color: "var(--muted)" }}>
        <span className="inline-flex items-center gap-2"><span className="h-3.5 w-3.5 rounded bg-emerald-300 border border-emerald-500" />Completed</span>
        <span className="inline-flex items-center gap-2"><span className="h-3.5 w-3.5 rounded bg-slate-200 border border-slate-400 dark:bg-slate-600 dark:border-slate-500" />Missed</span>
        <span className="inline-flex items-center gap-2"><span className="h-3.5 w-3.5 rounded bg-white border-2 border-sky-500 dark:bg-slate-800" />Today</span>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-1.5 sm:gap-2" aria-label={`${calendar.month} ${calendar.year} activity calendar`}>
        {weekDays.map((day) => (
          <span key={day} className="pb-1 text-center text-xs font-extrabold" style={{ color: "var(--muted)" }}>{day.slice(0, 1)}</span>
        ))}
        {Array.from({ length: calendar.firstWeekday }).map((_, index) => <span key={`empty-${index}`} aria-hidden="true" />)}
        {calendar.days.map((day) => {
          const isSelected = selectedDay.day === day.day;
          const sessionText = day.session ? `${day.session.gamesCompleted} games completed` : "No activity recorded";
          return (
            <button
              key={day.day}
              type="button"
              onClick={() => onSelect(day)}
              aria-pressed={isSelected}
              aria-label={`${calendar.month} ${day.day}, ${statusLabel[day.status]}. ${sessionText}`}
              className={`relative aspect-square min-h-10 sm:min-h-11 rounded-xl border text-sm sm:text-base font-extrabold transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-500 ${statusClasses[day.status]} ${isSelected ? "ring-2 ring-offset-2 ring-[#534AB7] dark:ring-offset-slate-800" : ""}`}
            >
              {day.day}
              {day.status === "completed" && <Check size={12} className="absolute right-1 top-1" aria-hidden="true" />}
            </button>
          );
        })}
      </div>

      <div className="mt-5 rounded-2xl border border-pale-sky/70 bg-[#F6FBFF] p-4 dark:bg-slate-800/70 dark:border-slate-700" aria-live="polite">
        <p className="font-extrabold text-[#185FA5] dark:text-sky-300">{calendar.month.slice(0, 3)} {selectedDay.day}</p>
        {selectedSession ? (
          <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2 text-sm sm:text-base">
            <p><span className="font-bold" style={{ color: "var(--muted)" }}>Games:</span> <span className="font-extrabold" style={{ color: "var(--foreground)" }}>{selectedSession.gamesCompleted} completed</span></p>
            <p><span className="font-bold" style={{ color: "var(--muted)" }}>Index:</span> <span className="font-extrabold" style={{ color: "var(--foreground)" }}>{selectedSession.performanceIndex}</span></p>
            <p><span className="font-bold" style={{ color: "var(--muted)" }}>Best area:</span> <span className="font-extrabold" style={{ color: "var(--foreground)" }}>{selectedSession.bestArea}</span></p>
            <p><span className="font-bold" style={{ color: "var(--muted)" }}>Time:</span> <span className="font-extrabold" style={{ color: "var(--foreground)" }}>{selectedSession.sessionMinutes} min</span></p>
          </div>
        ) : (
          <p className="mt-1 text-sm sm:text-base font-semibold" style={{ color: "var(--muted)" }}>No activity was recorded on this date.</p>
        )}
      </div>
    </section>
  );
}

function CognitivePerformance() {
  return (
    <section className="rounded-3xl border-2 border-lavender/45 p-5 sm:p-6 shadow-sm" style={{ backgroundColor: "var(--card-bg)" }}>
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-lavender/35 p-2 text-[#534AB7]">
          <BrainCircuit size={24} aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold" style={{ color: "var(--foreground)" }}>Your Cognitive Performance</h2>
          <p className="text-sm sm:text-base font-semibold" style={{ color: "var(--muted)" }}>Based on your recent game sessions</p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {dashboardData.cognitiveScores.map((score, index) => (
          <div key={score.id}>
            <div className="flex items-end justify-between gap-3">
              <span className="text-base sm:text-lg font-extrabold leading-tight" style={{ color: "var(--foreground)" }}>{score.name}</span>
              <span className="shrink-0 text-lg font-black tabular-nums text-[#534AB7] dark:text-[#CDB4DB]">{score.score}<span className="text-sm"> / 100</span></span>
            </div>
            <div className="mt-2 h-3.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700" role="progressbar" aria-label={`${score.name} score`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={score.score}>
              <div className={`h-full rounded-full ${scoreBarColors[index]}`} style={{ width: `${score.score}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function InsightCard() {
  const insights = getDashboardInsights();
  const attention = dashboardData.cognitiveScores.find((item) => item.id === "attention");

  return (
    <section className="rounded-3xl border-2 border-[#F0D7A1] bg-[#FFF9EA] p-5 sm:p-6 shadow-sm dark:bg-amber-950/30 dark:border-amber-800">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-[#F8DF9C] p-2 text-[#854F0B] dark:bg-amber-900 dark:text-amber-200">
          <Sparkles size={24} aria-hidden="true" />
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#6B430D] dark:text-amber-100">How are you doing?</h2>
      </div>
      <div className="mt-5 space-y-3 text-base sm:text-lg leading-snug" style={{ color: "var(--foreground)" }}>
        <p><span className="font-extrabold">Your strongest area is {insights.strongest.name}.</span> Your current score is {insights.strongest.score}.</p>
        <p><span className="font-extrabold">{insights.weakest.name} could use more practice.</span> Your current score is {insights.weakest.score}.</p>
        {attention && <p><span className="font-extrabold">This week, your Attention improved by {dashboardData.attentionChange}%.</span> Keep up your short daily sessions.</p>}
      </div>
    </section>
  );
}

function WeeklyTrend() {
  const data = dashboardData.weeklyPerformance;
  const [activeIndex, setActiveIndex] = useState(data.length - 1);
  const width = 580;
  const height = 190;
  const paddingX = 35;
  const baseline = 142;
  const scoreRange = 20;
  const points = data.map((item, index) => ({
    ...item,
    x: paddingX + (index * (width - paddingX * 2)) / (data.length - 1),
    y: baseline - ((item.score - 60) / scoreRange) * 92,
  }));
  const polylinePoints = points.map((point) => `${point.x},${point.y}`).join(" ");
  const activePoint = points[activeIndex];

  return (
    <section className="rounded-3xl border-2 border-pale-sky/60 p-5 sm:p-6 shadow-sm" style={{ backgroundColor: "var(--card-bg)" }}>
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-pale-sky/50 p-2 text-[#185FA5]">
          <TrendingUp size={24} aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold" style={{ color: "var(--foreground)" }}>Performance This Week</h2>
          <p className="text-sm sm:text-base font-semibold" style={{ color: "var(--muted)" }}>Performance Index</p>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl bg-[#F8FCFF] px-1 pt-3 dark:bg-slate-800/60">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label="Line chart showing Performance Index from Monday through Sunday">
          <line x1={paddingX} y1={baseline} x2={width - paddingX} y2={baseline} stroke="currentColor" className="text-slate-200 dark:text-slate-600" />
          <line x1={paddingX} y1={baseline - 46} x2={width - paddingX} y2={baseline - 46} stroke="currentColor" strokeDasharray="4 5" className="text-slate-100 dark:text-slate-700" />
          <polyline points={polylinePoints} fill="none" stroke="#5C9DDB" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          {points.map((point, index) => (
            <g
              key={point.day}
              role="button"
              tabIndex={0}
              aria-label={`${point.day}: Performance Index ${point.score}`}
              onMouseEnter={() => setActiveIndex(index)}
              onFocus={() => setActiveIndex(index)}
              onClick={() => setActiveIndex(index)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setActiveIndex(index);
                }
              }}
              className="cursor-pointer"
            >
              <title>{`${point.day}: Performance Index ${point.score}`}</title>
              <circle cx={point.x} cy={point.y} r="15" fill="transparent" />
              <circle cx={point.x} cy={point.y} r={index === activeIndex ? "7" : "5"} fill={index === activeIndex ? "#185FA5" : "#5C9DDB"} stroke="white" strokeWidth="3" />
              <text x={point.x} y={baseline + 28} textAnchor="middle" className="fill-slate-500 text-[14px] font-bold dark:fill-slate-300">{point.day}</text>
            </g>
          ))}
        </svg>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-sky-50 px-3 py-2.5 text-sm sm:text-base dark:bg-sky-950/35">
        <span className="font-extrabold text-[#185FA5] dark:text-sky-300">{activePoint.day}: {activePoint.score}</span>
        <span className="font-bold text-emerald-700 dark:text-emerald-300">↑ {dashboardData.summary.weeklyChange}% compared with last week</span>
      </div>
    </section>
  );
}

function TodayRecommendation() {
  const navigate = useNavigate();
  const insights = getDashboardInsights();

  return (
    <section className="rounded-3xl border-2 border-[#F3C4D3] bg-[#FFF4F7] p-5 sm:p-6 shadow-sm dark:bg-rose-950/25 dark:border-rose-900">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-[#FFD8E5] p-2 text-[#993C1D] dark:bg-rose-900 dark:text-rose-200">
          <Target size={24} aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#7F2942] dark:text-rose-100">Today&apos;s Recommendation</h2>
          <p className="text-sm sm:text-base font-semibold text-[#9E4B62] dark:text-rose-200">A short practice session is enough.</p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-white/75 p-4 dark:bg-slate-800/70">
        <p className="text-lg sm:text-xl font-extrabold" style={{ color: "var(--foreground)" }}>Practice {insights.weakest.name}</p>
        <p className="mt-2 text-base sm:text-lg font-semibold leading-snug" style={{ color: "var(--muted)" }}>
          Your current score is {insights.weakest.score}. {insights.weakest.name} could use a little more practice this week.
        </p>
        <p className="mt-3 text-sm sm:text-base font-bold text-[#7F2942] dark:text-rose-200">Suggested game: {insights.recommendation.gameName}</p>
      </div>

      <button
        type="button"
        onClick={() => navigate(insights.recommendation.path)}
        className="mt-5 min-h-12 w-full rounded-2xl bg-[#993C5B] px-5 py-3 text-base sm:text-lg font-extrabold text-white shadow-sm transition-colors hover:bg-[#7F2942] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#993C5B] active:scale-[0.98]"
      >
        <Gamepad2 size={21} aria-hidden="true" />
        Play Now
      </button>
    </section>
  );
}

function PerformanceByGame() {
  const insights = getDashboardInsights();

  return (
    <section className="rounded-3xl border-2 border-slate-200 p-5 sm:p-6 shadow-sm dark:border-slate-700" style={{ backgroundColor: "var(--card-bg)" }}>
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-slate-100 p-2 text-slate-700 dark:bg-slate-700 dark:text-slate-100">
          <Gamepad2 size={24} aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold" style={{ color: "var(--foreground)" }}>Performance by Game</h2>
          <p className="text-sm sm:text-base font-semibold" style={{ color: "var(--muted)" }}>Your recent game scores</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-7 gap-y-4">
        {dashboardData.gameScores.map((game) => {
          const Icon = gameIcons[game.icon];
          const accent = gameAccentStyles[game.accent];
          return (
            <div key={game.id} className="rounded-2xl border border-slate-100 p-3 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/70">
              <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
                <span className={`rounded-xl p-2 ${accent.icon}`}><Icon size={20} aria-hidden="true" /></span>
                <span className="min-w-0 text-base sm:text-lg font-extrabold leading-tight" style={{ color: "var(--foreground)" }}>{game.name}</span>
                <span className="text-lg font-black tabular-nums" style={{ color: "var(--foreground)" }}>{game.score}</span>
              </div>
              <div className="ml-12 mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700" role="progressbar" aria-label={`${game.name} score`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={game.score}>
                <div className={`h-full rounded-full ${accent.bar}`} style={{ width: `${game.score}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-5 rounded-2xl bg-[#F6FBFF] px-4 py-3 text-base sm:text-lg font-bold text-[#185FA5] dark:bg-sky-950/35 dark:text-sky-200">
        Your strongest recent game is {insights.bestGame.name} with a score of {insights.bestGame.score}.
      </p>
    </section>
  );
}

export function Dashboard() {
  const [selectedDay, setSelectedDay] = useState<CalendarDay>(() => dashboardData.calendar.days.find((day) => day.status === "today") ?? dashboardData.calendar.days[0]);
  const insights = getDashboardInsights();
  const positiveTrend = dashboardData.summary.weeklyChange >= 0;

  return (
    <div className="space-y-6 md:space-y-7 max-w-6xl mx-auto animate-in fade-in duration-300">
      <header className="pt-1">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: "var(--foreground)" }}>{dashboardData.greeting}, {dashboardData.userName}</h1>
        <p className="mt-1 text-base sm:text-lg font-semibold" style={{ color: "var(--muted)" }}>
          {positiveTrend ? "Your cognitive activity is improving this week." : "A short daily session can help build your routine."}
        </p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <SummaryCard icon={<Flame size={22} />} label="Current Streak" value={`${dashboardData.summary.streak} days`} supportingText={`Longest: ${dashboardData.summary.longestStreak} days`} tone="rose" />
        <SummaryCard icon={<TrendingUp size={22} />} label="Performance Index" value={`${dashboardData.summary.performanceIndex} / 100`} supportingText={`↑ ${dashboardData.summary.weeklyChange}% this week`} tone="violet" primary />
        <SummaryCard icon={<Gamepad2 size={22} />} label="Games Completed" value={`${dashboardData.summary.gamesCompleted}`} supportingText="This month" tone="green" />
        <SummaryCard icon={<TrendingUp size={22} />} label="Weekly Change" value={`${positiveTrend ? "+" : ""}${dashboardData.summary.weeklyChange}%`} supportingText="Compared with last week" tone="sky" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(300px,0.85fr)_minmax(0,1.55fr)] gap-5 md:gap-6">
        <div className="order-1 lg:order-1 lg:row-span-2">
          <ActivityCalendar selectedDay={selectedDay} onSelect={setSelectedDay} />
        </div>
        <div className="order-2 lg:order-3">
          <InsightCard />
        </div>
        <div className="order-3 lg:order-2">
          <CognitivePerformance />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.95fr)] gap-5 md:gap-6">
        <WeeklyTrend />
        <TodayRecommendation />
      </div>

      <PerformanceByGame />
    </div>
  );
}

export default Dashboard;
