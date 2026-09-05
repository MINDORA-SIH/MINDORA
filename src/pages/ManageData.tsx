import { ChevronLeft } from "lucide-react";
import { Link } from "react-router";
import { PeopleManager } from "@/components/dashboard/PeopleManager";

/**
 * `/manage-data` — where a caregiver maintains the records the activities read.
 *
 * Today that means the people behind "Who Is This?": their photo, name and
 * relationship to the patient. The page is a thin frame; each dataset brings its
 * own dashboard card, so a future activity can add one here without a redesign.
 */
export function ManageData() {
  return (
    <div className="space-y-4 sm:space-y-5">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-[20px] font-bold transition-colors hover:brightness-90"
        style={{ color: "var(--muted-strong)" }}
      >
        <ChevronLeft size={18} />
        Back to Dashboard
      </Link>

      <header className="space-y-1">
        <h1 className="text-2xl font-extrabold sm:text-3xl" style={{ color: "var(--foreground)" }}>
          Manage Data
        </h1>
        <p className="text-[17px] font-semibold" style={{ color: "var(--muted-strong)" }}>
          The photos, names and relationships the patient's activities use.
        </p>
      </header>

      <PeopleManager />
    </div>
  );
}

export default ManageData;
