import { ChevronLeft } from "lucide-react";
import { Link } from "react-router";
import { PeopleManager } from "@/components/dashboard/PeopleManager";
import { DailyRoutineManager } from "./DailyRoutineManager";
import { useTranslation } from "react-i18next";

/**
 * `/manage-data` — where a caregiver maintains the data the games read.
 *
 * Today that means the people behind "Who Is This?": their photo, name and
 * relationship to the patient. The page is a thin frame; each dataset brings its
 * own dashboard card, so a future activity can add one here without a redesign.
 */
export function ManageData() {
  const { t } = useTranslation();
  return (
    <div className="space-y-4 sm:space-y-5">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-[20px] font-bold transition-colors hover:brightness-90"
        style={{ color: "var(--muted-strong)" }}
      >
        <ChevronLeft size={18} />
        {t("navigation.backToDashboard")}
      </Link>

      <header className="space-y-1">
        <h1 className="text-2xl font-extrabold sm:text-3xl" style={{ color: "var(--foreground)" }}>
          {t("manageData.title")}
        </h1>
        <p className="text-[17px] font-semibold" style={{ color: "var(--muted-strong)" }}>
          {t("manageData.subtitle")}
        </p>
      </header>

      <PeopleManager />
      <DailyRoutineManager embedded />
    </div>
  );
}

export default ManageData;
