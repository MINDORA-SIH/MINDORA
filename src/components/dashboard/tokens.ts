import {
  Eye,
  FileText,
  LayoutGrid,
  ListCheck,
  Music,
  Users,
} from "lucide-react"
import type { ComponentType } from "react"
import type {
  ActivityLevelId,
  AttentionSeverity,
  GameAccent,
  GameIconName,
  InsightTone,
  MonitoringStatusId,
  TrendDirection,
} from "@/data/dashboardTypes"

export type IconComponent = ComponentType<{ className?: string }>

export type SemanticTone = "stable" | "monitor" | "alert" | "neutral" | "info" | "brand"

export interface ToneStyle {
  surface: string
  border: string
  text: string
  dot: string
  bar: string
}

/**
 * Monitoring palette. Green reads as stable, amber as "keep an eye on this",
 * red is reserved for a sustained change — calm in both themes, and kept clear
 * of the global dark-mode class overrides in index.css.
 */
export const TONES: Record<SemanticTone, ToneStyle> = {
  stable: {
    surface: "bg-[#EDFBF3] dark:bg-[#12352A]",
    border: "border-[#B6E3C8] dark:border-[#27543E]",
    text: "text-[#186B47] dark:text-[#8FE3B4]",
    dot: "bg-[#2E9E68]",
    bar: "bg-[#2E9E68]",
  },
  monitor: {
    surface: "bg-[#FFF7E6] dark:bg-[#3A2C10]",
    border: "border-[#F0D79E] dark:border-[#5E4718]",
    text: "text-[#8A5B0B] dark:text-[#F5CE83]",
    dot: "bg-[#D98B1F]",
    bar: "bg-[#D98B1F]",
  },
  alert: {
    surface: "bg-[#FDEEEE] dark:bg-[#3B1A1A]",
    border: "border-[#F0BDBD] dark:border-[#6B2B2B]",
    text: "text-[#A32E2E] dark:text-[#F6A5A5]",
    dot: "bg-[#C93A3A]",
    bar: "bg-[#C93A3A]",
  },
  neutral: {
    surface: "bg-[#F4F6FA] dark:bg-[#232F42]",
    border: "border-[#DCE3EC] dark:border-[#33405A]",
    text: "text-[#4A5568] dark:text-[#B6C2D4]",
    dot: "bg-[#94A3B8]",
    bar: "bg-[#7C8DA6]",
  },
  info: {
    surface: "bg-[#F1F7FE] dark:bg-[#17293D]",
    border: "border-[#C3DEF7] dark:border-[#2C4562]",
    text: "text-[#185FA5] dark:text-[#9FD0FF]",
    dot: "bg-[#3B82C4]",
    bar: "bg-[#4A90CE]",
  },
  brand: {
    surface: "bg-[#F5F2FF] dark:bg-[#251F3D]",
    border: "border-[#D6CBF5] dark:border-[#44386B]",
    text: "text-[#5044A8] dark:text-[#C4B5FD]",
    dot: "bg-[#6C5CC4]",
    bar: "bg-[#6C5CC4]",
  },
}

export const STATUS_TONE: Record<MonitoringStatusId, SemanticTone> = {
  stable: "stable",
  monitoring: "monitor",
  attention: "alert",
}

export const ACTIVITY_TONE: Record<ActivityLevelId, SemanticTone> = {
  high: "stable",
  moderate: "monitor",
  low: "alert",
  none: "alert",
}

export const SEVERITY_TONE: Record<AttentionSeverity, SemanticTone> = {
  none: "stable",
  monitor: "monitor",
  attention: "alert",
}

export const INSIGHT_TONE: Record<InsightTone, SemanticTone> = {
  positive: "stable",
  neutral: "info",
  watch: "monitor",
}

export const DIRECTION_TONE: Record<TrendDirection, SemanticTone> = {
  up: "stable",
  down: "monitor",
  flat: "neutral",
}

/** Score bands: strong, expected range, needs monitoring. */
export function scoreTone(score: number): SemanticTone {
  if (score >= 75) return "stable"
  if (score >= 60) return "info"
  return "monitor"
}

export const GAME_ICONS: Record<GameIconName, IconComponent> = {
  users: Users,
  "file-text": FileText,
  eye: Eye,
  grid: LayoutGrid,
  music: Music,
  "list-check": ListCheck,
}

/** Per-activity accent chips, matching the colours used on the games grid. */
export const ACCENT_CHIPS: Record<GameAccent, string> = {
  rose: "bg-[#FAECE7] text-[#993C1D] dark:bg-[#3B1F2B] dark:text-[#F3BFA9]",
  sky: "bg-[#E6F1FB] text-[#185FA5] dark:bg-[#1E2A3B] dark:text-[#9FD0FF]",
  violet: "bg-[#EEEDFE] text-[#534AB7] dark:bg-[#2A1E3B] dark:text-[#C4B5FD]",
  amber: "bg-[#FAEEDA] text-[#854F0B] dark:bg-[#3B2E1E] dark:text-[#F5CE83]",
  green: "bg-[#EAF3DE] text-[#3B6D11] dark:bg-[#1E3B2A] dark:text-[#B7E39A]",
  teal: "bg-[#E1F5EE] text-[#0F6E56] dark:bg-[#1E3B33] dark:text-[#8FE3C8]",
}
