import { clsx } from "clsx";
import { Lightbulb } from "lucide-react";
import type { CaregiverInsight } from "@/data/dashboardSelectors";
import { INSIGHT_TONE, TONES } from "./tokens";
import { SectionCard } from "./ui";

export function KeyInsights({ insights }: { insights: CaregiverInsight[] }) {
  return (
    <SectionCard
      title="Key Insights"
      subtitle="Observations derived from recent activity data"
      icon={Lightbulb}
      tone="info"
      className="h-full"
    >
      <ul className="space-y-2.5">
        {insights.map((insight) => {
          const toneStyle = TONES[INSIGHT_TONE[insight.tone]];
          return (
            <li key={insight.id} className={clsx("rounded-2xl border px-4 py-3", toneStyle.surface, toneStyle.border)}>
              <div className="flex items-start gap-2.5">
                <span aria-hidden="true" className={clsx("mt-2 h-2.5 w-2.5 shrink-0 rounded-full", toneStyle.dot)} />
                <div className="min-w-0">
                  <p className="text-[15px] font-extrabold leading-snug" style={{ color: "var(--foreground)" }}>
                    {insight.title}
                  </p>
                  <p className="mt-0.5 text-[14px] leading-snug" style={{ color: "var(--muted-strong)" }}>
                    {insight.detail}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </SectionCard>
  );
}
