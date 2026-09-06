import { clsx } from "clsx";
import { ClipboardList } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { SessionEntry } from "@/data/dashboardSelectors";
import { ACCENT_CHIPS, GAME_ICONS } from "./tokens";
import { SectionCard } from "./ui";

/**
 * Chronological log of what the patient actually did. Kept as a plain list —
 * a caregiver reads it to confirm participation, not to compare scores.
 */
export function RecentActivity({ sessions }: { sessions: SessionEntry[] }) {
  const { t } = useTranslation();
  return (
    <SectionCard
      title={t("dashboard.recentActivity", { defaultValue: "Recent Activity" })}
      subtitle={t("dashboard.individualSessions", { defaultValue: "Individual sessions, most recent first" })}
      icon={ClipboardList}
      tone="neutral"
    >
      <ul className="grid grid-cols-1 gap-2.5 lg:grid-cols-2">
        {sessions.map((session) => {
          const Icon = GAME_ICONS[session.icon];
          return (
            <li
              key={session.id}
              className="flex items-center gap-3 rounded-2xl border border-[#DCE3EC] px-3.5 py-3 dark:border-[#33405A]"
            >
              <span
                aria-hidden="true"
                className={clsx("grid h-11 w-11 shrink-0 place-items-center rounded-2xl", ACCENT_CHIPS[session.accent])}
              >
                <Icon className="h-5 w-5" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[16px] font-extrabold" style={{ color: "var(--foreground)" }}>
                  {session.gameName}
                </p>
                <p className="mt-0.5 text-[13px] font-semibold" style={{ color: "var(--muted)" }}>
                  {session.dayLabel} · {session.timeLabel} · {session.minutes} min
                </p>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-[19px] font-extrabold leading-none" style={{ color: "var(--foreground)" }}>
                  {session.score}
                </p>
                <p className="mt-1 text-[12px] font-extrabold uppercase tracking-[0.08em]" style={{ color: "var(--muted)" }}>
                  {t("dashboard.score", { defaultValue: "Score" })}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </SectionCard>
  );
}
