import { clsx } from "clsx"
import { Brain, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import type { ParameterInsight } from "@/data/dashboardSelectors"
import type { CognitiveParameterId } from "@/data/dashboardTypes"
import { scoreTone } from "./tokens"
import { PerformanceProfileRadar } from "./PerformanceProfileRadar"
import { ProgressBar, SectionCard, StatTile, TrendBadge } from "./ui"

interface CognitivePerformanceProps {
  parameters: ParameterInsight[]
  strongest: ParameterInsight
  weakest: ParameterInsight
  improving: ParameterInsight | null
  /** Set when the caregiver arrives here from the Attention Required panel. */
  highlightedId: CognitiveParameterId | null
}

function Tag({ label, className }: { label: string; className: string }) {
  return (
    <span
      className={clsx(
        "rounded-full border px-2 py-0.5 text-[12px] font-extrabold whitespace-nowrap",
        className,
      )}
    >
      {label}
    </span>
  )
}

export function CognitivePerformance({
  parameters,
  strongest,
  weakest,
  improving,
  highlightedId,
}: CognitivePerformanceProps) {
  const { t } = useTranslation()
  const [showProfile, setShowProfile] = useState(false)

  return (
    <SectionCard
      id="cognitive-performance"
      title={t("dashboard.cognitivePerformanceTitle", "Cognitive Performance")}
      subtitle={t("dashboard.cognitivePerformanceSubtitle", "Recent performance across cognitive activities")}
      icon={Brain}
      tone="brand"
      className="scroll-mt-4"
    >
      <ul className="grid grid-cols-1 gap-x-8 gap-y-1 xl:grid-cols-2">
        {parameters.map((parameter) => {
          const isHighlighted = parameter.id === highlightedId
          return (
            <li
              key={parameter.id}
              className={clsx(
                "rounded-2xl border-2 px-3 py-2.5 transition-colors",
                isHighlighted
                  ? "border-[#6C5CC4] bg-[#F5F2FF] dark:border-[#8B7BE0] dark:bg-[#251F3D]"
                  : "border-transparent",
              )}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <p
                  className="text-[17px] font-extrabold"
                  style={{ color: "var(--foreground)" }}
                >
                  {parameter.name}
                </p>
                <div className="flex items-center gap-2">
                  <p
                    className="text-[17px] font-extrabold"
                    style={{ color: "var(--foreground)" }}
                  >
                    {parameter.score}
                    <span
                      className="text-[13px] font-bold"
                      style={{ color: "var(--muted)" }}
                    >
                      {" "}
                      / 100
                    </span>
                  </p>
                  <TrendBadge
                    changePercent={parameter.changePercent}
                    direction={parameter.direction}
                  />
                </div>
              </div>

              <div className="mt-2">
                <ProgressBar
                  value={parameter.score}
                  tone={scoreTone(parameter.score)}
                  label={`${parameter.name}: ${parameter.score} ${t("dashboard.outOf100", "out of 100")}`}
                />
              </div>

              <div className="mt-1.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  {parameter.id === strongest.id ? (
                    <Tag
                      label={t("dashboard.strongestArea", "Strongest area")}
                      className="border-[#B6E3C8] bg-[#EDFBF3] text-[#186B47] dark:border-[#27543E] dark:bg-[#12352A] dark:text-[#8FE3B4]"
                    />
                  ) : null}
                  {parameter.id === weakest.id ? (
                    <Tag
                      label={t("dashboard.needsMonitoring", "Needs monitoring")}
                      className="border-[#F0D79E] bg-[#FFF7E6] text-[#8A5B0B] dark:border-[#5E4718] dark:bg-[#3A2C10] dark:text-[#F5CE83]"
                    />
                  ) : null}
                  {improving &&
                  parameter.id === improving.id &&
                  parameter.id !== strongest.id ? (
                    <Tag
                      label={t("dashboard.improving", "Improving")}
                      className="border-[#C3DEF7] bg-[#F1F7FE] text-[#185FA5] dark:border-[#2C4562] dark:bg-[#17293D] dark:text-[#9FD0FF]"
                    />
                  ) : null}
                </div>
                <p
                  className="text-[13px] font-semibold"
                  style={{ color: "var(--muted)" }}
                >
                  {parameter.relatedActivity} · {parameter.relatedActivityWhen}
                </p>
              </div>
            </li>
          )
        })}
      </ul>

      <dl className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        <StatTile
          label={t("dashboard.strongestArea", "Strongest area")}
          value={strongest.name}
          hint={`${strongest.score} / 100`}
          tone="stable"
        />
        <StatTile
          label={t("dashboard.needsMonitoring", "Needs monitoring")}
          value={weakest.name}
          hint={`${weakest.score} / 100`}
          tone="monitor"
        />
        <StatTile
          label={t("dashboard.mostImproved", "Most improved")}
          value={improving ? improving.name : t("dashboard.noChangeRecorded", "No change recorded")}
          hint={
            improving
              ? t("dashboard.upFromLastWeek", "Up {{percent}}% from last week", { percent: improving.changePercent })
              : t("dashboard.allAreasLevel", "All areas level with last week")
          }
          tone="info"
        />
      </dl>

      <div className="mt-4 border-t border-slate-200 pt-3 dark:border-slate-700">
        <button
          type="button"
          onClick={() => setShowProfile((visible) => !visible)}
          aria-expanded={showProfile}
          aria-controls="performance-profile"
          className="tap-target gap-1.5 rounded-2xl border-2 border-slate-200 px-4 py-2 text-[15px] font-extrabold transition-colors hover:bg-slate-50 focus-visible:outline-3 focus-visible:outline-offset-2 dark:border-slate-700 dark:hover:bg-slate-700"
          style={{ color: "var(--foreground)" }}
        >
          {showProfile
            ? t("dashboard.hidePerformanceProfile", "Hide performance profile")
            : t("dashboard.viewPerformanceProfile", "View performance profile")}
          {showProfile ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {showProfile ? (
          <div id="performance-profile" className="mt-3">
            <PerformanceProfileRadar parameters={parameters} />
          </div>
        ) : null}
      </div>
    </SectionCard>
  )
}

