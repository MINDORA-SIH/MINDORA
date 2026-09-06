import { clsx } from "clsx";
import { ArrowRight, BellRing, Database, LayoutGrid, MessageCircle, Stethoscope, UserRound } from "lucide-react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { type IconComponent, type SemanticTone, TONES } from "./tokens";
import { SectionCard } from "./ui";

interface ActionLink {
  to: string;
  labelKey: string;
  descriptionKey: string;
  defaultLabel: string;
  defaultDescription: string;
  icon: IconComponent;
  tone: SemanticTone;
}

/** Every tile points at a route that already exists — nothing here is a stub. */
const ACTIONS: ActionLink[] = [
  {
    to: "/profile",
    labelKey: "dashboard.patientProfile", descriptionKey: "dashboard.patientProfileDescription", defaultLabel: "Patient Profile", defaultDescription: "Personal and medical details on record",
    icon: UserRound,
    tone: "brand",
  },
  {
    to: "/manage-data",
    labelKey: "dashboard.manageGameData", descriptionKey: "dashboard.manageGameDataDescription", defaultLabel: "Manage Game Data", defaultDescription: "People, photos, relationships and daily routines",
    icon: Database,
    tone: "info",
  },
  {
    to: "/reminders",
    labelKey: "dashboard.dailyReminders", descriptionKey: "dashboard.dailyRemindersDescription", defaultLabel: "Daily Reminders", defaultDescription: "Review and adjust the routine schedule",
    icon: BellRing,
    tone: "monitor",
  },
  {
    to: "/",
    labelKey: "dashboard.activityLibrary", descriptionKey: "dashboard.activityLibraryDescription", defaultLabel: "Activity Library", defaultDescription: "Open the activities available to the patient",
    icon: LayoutGrid,
    tone: "info",
  },
  {
    to: "/chatbot",
    labelKey: "dashboard.assistant", descriptionKey: "dashboard.assistantDescription", defaultLabel: "Mindora Assistant", defaultDescription: "Ask a question about using the app",
    icon: MessageCircle,
    tone: "stable",
  },
];

export function CaregiverActions() {
  const { t } = useTranslation();
  return (
    <SectionCard title={t("dashboard.caregiverActions", { defaultValue: "Caregiver Actions" })} subtitle={t("dashboard.caregiverActionsSubtitle", { defaultValue: "Jump to the tools you manage" })} icon={Stethoscope} tone="brand">
      <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {ACTIONS.map((action) => {
          const toneStyle = TONES[action.tone];
          const Icon = action.icon;
          return (
            <li key={action.to + action.labelKey}>
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
                  className={clsx("grid h-11 w-11 shrink-0 place-items-center rounded-2xl border bg-white/70 dark:bg-black/20", toneStyle.border)}
                >
                  <Icon className={clsx("h-5 w-5", toneStyle.text)} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[16px] font-extrabold" style={{ color: "var(--foreground)" }}>
                    {t(action.labelKey, { defaultValue: action.defaultLabel })}
                  </span>
                  <span className="block text-[13px] font-semibold" style={{ color: "var(--muted-strong)" }}>
                    {t(action.descriptionKey, { defaultValue: action.defaultDescription })}
                  </span>
                </span>
                <ArrowRight aria-hidden="true" className={clsx("h-5 w-5 shrink-0", toneStyle.text)} />
              </Link>
            </li>
          );
        })}
      </ul>
    </SectionCard>
  );
}
