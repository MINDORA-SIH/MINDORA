import { clsx } from "clsx"
import {
  ArrowRight,
  BellRing,
  Database,
  LayoutGrid,
  MessageCircle,
  Stethoscope,
  UserRound,
} from "lucide-react"
import { Link } from "react-router"
import { useTranslation } from "react-i18next"
import { type IconComponent, type SemanticTone, TONES } from "./tokens"
import { SectionCard } from "./ui"

interface ActionLink {
  to: string
  label: string
  description: string
  icon: IconComponent
  tone: SemanticTone
}

export function CaregiverActions() {
  const { t } = useTranslation()

  const ACTIONS: ActionLink[] = [
    {
      to: "/profile",
      label: t("dashboard.actionsProfileLabel", "Patient Profile"),
      description: t("dashboard.actionsProfileDesc", "Personal and medical details on record"),
      icon: UserRound,
      tone: "brand",
    },
    {
      to: "/manage-data",
      label: t("dashboard.actionsManageDataLabel", "Manage Game Data"),
      description: t("dashboard.actionsManageDataDesc", "People, photos, relationships and daily routines"),
      icon: Database,
      tone: "info",
    },
    {
      to: "/reminders",
      label: t("dashboard.actionsRemindersLabel", "Daily Reminders"),
      description: t("dashboard.actionsRemindersDesc", "Review and adjust the routine schedule"),
      icon: BellRing,
      tone: "monitor",
    },
    {
      to: "/",
      label: t("dashboard.actionsLibraryLabel", "Activity Library"),
      description: t("dashboard.actionsLibraryDesc", "Open the activities available to the patient"),
      icon: LayoutGrid,
      tone: "info",
    },
    {
      to: "/chatbot",
      label: t("dashboard.actionsChatbotLabel", "Mindora Assistant"),
      description: t("dashboard.actionsChatbotDesc", "Ask a question about using the app"),
      icon: MessageCircle,
      tone: "stable",
    },
  ]

  return (
    <SectionCard
      title={t("dashboard.caregiverActionsTitle", "Caregiver Actions")}
      subtitle={t("dashboard.caregiverActionsSubtitle", "Jump to the tools you manage")}
      icon={Stethoscope}
      tone="brand"
    >
      <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {ACTIONS.map((action) => {
          const toneStyle = TONES[action.tone]
          const Icon = action.icon
          return (
            <li key={action.to + action.label}>
              <Link
                to={action.to}
                className={clsx(
                  "tap-target w-full justify-start gap-3 rounded-2xl border px-3.5 py-3 text-left transition-colors hover:brightness-[0.98] focus-visible:outline-3 focus-visible:outline-offset-2",
                  toneStyle.surface,
                  toneStyle.border,
                )}
              >
                <span
                  aria-hidden="true"
                  className={clsx(
                    "grid h-11 w-11 shrink-0 place-items-center rounded-2xl border bg-white/70 dark:bg-black/20",
                    toneStyle.border,
                  )}
                >
                  <Icon className={clsx("h-5 w-5", toneStyle.text)} />
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className="block text-[16px] font-extrabold"
                    style={{ color: "var(--foreground)" }}
                  >
                    {action.label}
                  </span>
                  <span
                    className="block text-[13px] font-semibold"
                    style={{ color: "var(--muted-strong)" }}
                  >
                    {action.description}
                  </span>
                </span>
                <ArrowRight
                  aria-hidden="true"
                  className={clsx("h-5 w-5 shrink-0", toneStyle.text)}
                />
              </Link>
            </li>
          )
        })}
      </ul>
    </SectionCard>
  )
}
