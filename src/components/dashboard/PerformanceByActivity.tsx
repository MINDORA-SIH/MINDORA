import { clsx } from "clsx";
import { Gauge } from "lucide-react";
import type { GamePerformanceEntry } from "@/data/dashboardSelectors";
import { ACCENT_CHIPS, GAME_ICONS, TONES, scoreTone } from "./tokens";
import { ProgressBar, SectionCard, TrendBadge } from "./ui";

interface PerformanceByActivityProps {
  games: GamePerformanceEntry[];
  focusInsight: string;
}

/**
 * Per-activity scores. Framed as current performance by activity rather than a
 * ranking, so no single weak result reads as a verdict on the patient.
 */
export function PerformanceByActivity({ games, focusInsight }: PerformanceByActivityProps) {
  const infoTone = TONES.info;

  return (
    <SectionCard
      title="Performance by Activity"
      subtitle="Current performance by activity, with change from the previous session set"
      icon={Gauge}
      tone="info"
    >
      <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
        {games.map((game) => {
          const Icon = GAME_ICONS[game.icon];
          return (
            <li
              key={game.id}
              className="rounded-2xl border border-[#DCE3EC] px-3.5 py-3 dark:border-[#33405A]"
            >
              <div className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className={clsx("grid h-10 w-10 shrink-0 place-items-center rounded-2xl", ACCENT_CHIPS[game.accent])}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[16px] font-extrabold leading-snug" style={{ color: "var(--foreground)" }}>
                    {game.name}
                  </p>
                  <p className="text-[13px] font-semibold" style={{ color: "var(--muted)" }}>
                    {game.focus}
                  </p>
                </div>
              </div>

              <div className="mt-2.5 flex items-center justify-between gap-2">
                <p className="text-[17px] font-extrabold" style={{ color: "var(--foreground)" }}>
                  {game.score}
                  <span className="text-[13px] font-bold" style={{ color: "var(--muted)" }}>
                    {" "}
                    / 100
                  </span>
                </p>
                <TrendBadge changePercent={game.changePercent} direction={game.direction} />
              </div>

              <div className="mt-2">
                <ProgressBar
                  value={game.score}
                  tone={scoreTone(game.score)}
                  label={`${game.name}: ${game.score} out of 100`}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <p
        className={clsx("mt-3 rounded-2xl border px-4 py-3 text-[15px] font-bold", infoTone.surface, infoTone.border)}
        style={{ color: "var(--foreground)" }}
      >
        {focusInsight}
      </p>
    </SectionCard>
  );
}
