import { clsx } from "clsx";
import { ChevronRight, CircleCheck, TriangleAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { AttentionState } from "@/data/dashboardSelectors";
import { SEVERITY_TONE, TONES } from "./tokens";

interface AttentionRequiredProps {
  attention: AttentionState;
  onViewDetails: () => void;
}

function Fact({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={clsx("rounded-2xl border border-white/70 bg-white/75 px-3.5 py-2.5 dark:border-white/10 dark:bg-white/5", className)}>
      <dt className="text-[12px] font-extrabold uppercase tracking-[0.1em]" style={{ color: "var(--muted-strong)" }}>
        {label}
      </dt>
      <dd className="mt-0.5 text-[16px] font-extrabold leading-snug" style={{ color: "var(--foreground)" }}>
        {value}
      </dd>
    </div>
  );
}

/**
 * The dashboard's alert lane. Wording and severity both come from the data
 * layer, so the panel switches to its all-clear state on its own.
 */
export function AttentionRequired({ attention, onViewDetails }: AttentionRequiredProps) {
  const { t } = useTranslation();
  const toneStyle = TONES[SEVERITY_TONE[attention.severity]];
  const parameter = attention.parameter;
  const Icon = attention.severity === "none" ? CircleCheck : TriangleAlert;

  return (
    <section
      aria-live="polite"
      className={clsx("rounded-3xl border-2 p-5 shadow-sm sm:p-6", toneStyle.surface, toneStyle.border)}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-3.5">
          <span
            aria-hidden="true"
            className={clsx(
              "grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/80 dark:bg-white/10",
              toneStyle.text,
            )}
          >
            <Icon className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <h2 className={clsx("text-[19px] font-extrabold leading-tight sm:text-xl", toneStyle.text)}>
              {attention.title}
            </h2>
            <p className="mt-1 text-[16px] font-bold leading-snug" style={{ color: "var(--foreground)" }}>
              {attention.message}
            </p>
            <p className="mt-1 text-[14px] leading-snug" style={{ color: "var(--muted-strong)" }}>
              {attention.recommendation}
            </p>
          </div>
        </div>

        {parameter ? (
          <button
            type="button"
            onClick={onViewDetails}
            className={clsx(
              "tap-target shrink-0 gap-1.5 rounded-2xl border-2 bg-white/90 px-4 py-2.5 text-[15px] font-extrabold shadow-xs transition-transform focus-visible:outline-3 focus-visible:outline-offset-2 active:scale-95 dark:bg-white/10",
              toneStyle.border,
              toneStyle.text,
            )}
          >
            {t("dashboard.viewDetails", { defaultValue: "View Details" })}
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {parameter ? (
        <dl className="mt-4 grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
          <Fact label={t("dashboard.currentScore", { defaultValue: "Current score" })} value={`${parameter.score} / 100`} />
          <Fact label={t("dashboard.previousWeek", { defaultValue: "Previous week" })} value={`${parameter.previousScore} / 100`} />
          <Fact label={t("dashboard.change", { defaultValue: "Change" })} value={`${parameter.changePercent}%`} />
          <Fact
            label={t("dashboard.lastRelatedActivity", { defaultValue: "Last related activity" })}
            value={`${parameter.relatedActivity} · ${parameter.relatedActivityWhen}`}
            className="col-span-2 lg:col-span-1"
          />
        </dl>
      ) : null}
    </section>
  );
}
