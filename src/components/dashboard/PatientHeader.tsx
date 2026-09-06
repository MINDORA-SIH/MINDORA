import { clsx } from "clsx";
import { useTranslation } from "react-i18next";
import type { ActivitySummary, MonitoringStatus } from "@/data/dashboardSelectors";
import type { Patient } from "@/data/dashboardTypes";
import { STATUS_TONE } from "./tokens";
import { CARD_CLASS, CARD_STYLE, StatusPill } from "./ui";

interface PatientHeaderProps {
  patient: Patient;
  status: MonitoringStatus;
  lastActiveLabel: string;
  activity: ActivitySummary;
}

export function PatientHeader({ patient, status, lastActiveLabel, activity }: PatientHeaderProps) {
  const { t } = useTranslation();
  const facts = [
    { label: t("dashboard.age", { defaultValue: "Age" }), value: `${patient.age} ${t("profile.years", { count: 0, defaultValue: "years" }).replace(/^0\s*/, "")}` },
    { label: t("dashboard.carePlan", { defaultValue: "Care plan" }), value: patient.carePlan },
    { label: t("dashboard.lastActive", { defaultValue: "Last active" }), value: lastActiveLabel },
  ];

  return (
    <section className={clsx(CARD_CLASS, "p-5 sm:p-6")} style={CARD_STYLE}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <span
            aria-hidden="true"
            className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border-2 border-[#F3C7D6] bg-[#FDEBF1] text-xl font-extrabold text-[#9B3355] sm:h-16 sm:w-16 dark:border-[#5C2D3D] dark:bg-[#3A1B27] dark:text-[#FFC3D6]"
          >
            {patient.initials}
          </span>
          <div className="min-w-0">
            <p
              className="text-[13px] font-extrabold uppercase tracking-[0.14em]"
              style={{ color: "var(--muted)" }}
            >
              {t("dashboard.patientOverview", { defaultValue: "Patient Overview" })}
            </p>
            <h1
              className="text-2xl font-extrabold leading-tight sm:text-3xl"
              style={{ color: "var(--foreground)" }}
            >
              {patient.name}
            </h1>
            <dl className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[15px]">
              {facts.map((fact) => (
                <div key={fact.label} className="flex items-center gap-1.5">
                  <dt className="font-semibold" style={{ color: "var(--muted)" }}>
                    {fact.label}:
                  </dt>
                  <dd className="font-bold" style={{ color: "var(--foreground)" }}>
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-1.5 lg:items-end">
          <StatusPill label={status.label} tone={STATUS_TONE[status.id]} />
          <p className="text-[15px] font-bold" style={{ color: "var(--foreground)" }}>
            {t("dashboard.activeDays", { active: activity.activeDays, window: activity.windowDays, defaultValue: `Active ${activity.activeDays} of the last ${activity.windowDays} days` })}
          </p>
          <p className="max-w-sm text-[13px] leading-snug lg:text-right" style={{ color: "var(--muted)" }}>
            {t("dashboard.monitoringIndicator", { defaultValue: "Monitoring indicator" }) + " · " + status.description}
          </p>
        </div>
      </div>
    </section>
  );
}
