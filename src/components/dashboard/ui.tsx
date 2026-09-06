import { clsx } from "clsx"
import { Minus, TrendingDown, TrendingUp } from "lucide-react"
import type { ReactNode } from "react"
import type { TrendDirection } from "@/data/dashboardTypes"
import { type IconComponent, type SemanticTone, TONES } from "./tokens"

/** Shared card shell: soft border, gentle shadow, theme-aware surface. */
export const CARD_CLASS =
  "rounded-3xl border-2 border-slate-200 dark:border-slate-700 shadow-sm"

export const CARD_STYLE = { backgroundColor: "var(--card-bg)" } as const

interface SectionCardProps {
  id?: string
  title: string
  subtitle?: string
  icon?: IconComponent
  tone?: SemanticTone
  action?: ReactNode
  children: ReactNode
  className?: string
}

export function SectionCard({
  id,
  title,
  subtitle,
  icon: Icon,
  tone = "brand",
  action,
  children,
  className,
}: SectionCardProps) {
  const toneStyle = TONES[tone]
  return (
    <section
      id={id}
      className={clsx(CARD_CLASS, "p-5 sm:p-6", className)}
      style={CARD_STYLE}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          {Icon ? (
            <span
              aria-hidden="true"
              className={clsx(
                "grid h-11 w-11 shrink-0 place-items-center rounded-2xl border",
                toneStyle.surface,
                toneStyle.border,
              )}
            >
              <Icon className={clsx("h-5 w-5", toneStyle.text)} />
            </span>
          ) : null}
          <div className="min-w-0">
            <h2
              className="text-[19px] font-extrabold leading-tight sm:text-xl"
              style={{ color: "var(--foreground)" }}
            >
              {title}
            </h2>
            {subtitle ? (
              <p
                className="mt-0.5 text-[15px] leading-snug"
                style={{ color: "var(--muted)" }}
              >
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

export function StatusPill({
  label,
  tone,
}: {
  label: string
  tone: SemanticTone
}) {
  const toneStyle = TONES[tone]
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-2 rounded-full border-2 px-3.5 py-1.5 text-[15px] font-extrabold",
        toneStyle.surface,
        toneStyle.border,
        toneStyle.text,
      )}
    >
      <span
        aria-hidden="true"
        className={clsx("h-2.5 w-2.5 rounded-full", toneStyle.dot)}
      />
      {label}
    </span>
  )
}

const TREND_ICONS: Record<TrendDirection, IconComponent> = {
  up: TrendingUp,
  down: TrendingDown,
  flat: Minus,
}

interface TrendBadgeProps {
  changePercent: number
  direction: TrendDirection
  /** Optional context, e.g. "vs last week". */
  suffix?: string
  tone?: SemanticTone
}

export function TrendBadge({
  changePercent,
  direction,
  suffix,
  tone,
}: TrendBadgeProps) {
  const toneStyle =
    TONES[
      tone ??
        (direction === "up"
          ? "stable"
          : direction === "down"
            ? "monitor"
            : "neutral")
    ]
  const Icon = TREND_ICONS[direction]
  const value =
    direction === "flat"
      ? "No change"
      : `${direction === "up" ? "+" : "-"}${Math.abs(changePercent)}%`
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[13px] font-extrabold whitespace-nowrap",
        toneStyle.surface,
        toneStyle.border,
        toneStyle.text,
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {value}
      {suffix ? (
        <span className="font-semibold opacity-80">{suffix}</span>
      ) : null}
    </span>
  )
}

export function ProgressBar({
  value,
  tone,
  label,
}: {
  value: number
  tone: SemanticTone
  label: string
}) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"
    >
      <div
        className={clsx("h-full rounded-full", TONES[tone].bar)}
        style={{ width: `${Math.max(value, 2)}%` }}
      />
    </div>
  )
}

interface SegmentedMeterProps {
  filled: number
  total?: number
  tone: SemanticTone
  label: string
}

/** Blocked meter (████████░░) — readable at a glance without reading numbers. */
export function SegmentedMeter({
  filled,
  total = 10,
  tone,
  label,
}: SegmentedMeterProps) {
  return (
    <div role="img" aria-label={label} className="flex items-center gap-1.5">
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className={clsx(
            "h-3.5 flex-1 rounded-full",
            index < filled ? TONES[tone].bar : "bg-slate-200 dark:bg-slate-700",
          )}
        />
      ))}
    </div>
  )
}

interface StatTileProps {
  label: string
  value: string
  hint?: string
  tone?: SemanticTone
}

export function StatTile({
  label,
  value,
  hint,
  tone = "neutral",
}: StatTileProps) {
  const toneStyle = TONES[tone]
  return (
    <div
      className={clsx(
        "rounded-2xl border px-3.5 py-3",
        toneStyle.surface,
        toneStyle.border,
      )}
    >
      <dt
        className="text-[12px] font-extrabold uppercase tracking-[0.1em]"
        style={{ color: "var(--muted-strong)" }}
      >
        {label}
      </dt>
      <dd
        className="mt-1 text-[17px] font-extrabold leading-tight"
        style={{ color: "var(--foreground)" }}
      >
        {value}
      </dd>
      {hint ? (
        <dd
          className="text-[13px] leading-snug"
          style={{ color: "var(--muted-strong)" }}
        >
          {hint}
        </dd>
      ) : null}
    </div>
  )
}
