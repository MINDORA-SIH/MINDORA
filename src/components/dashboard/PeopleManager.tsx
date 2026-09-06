import { clsx } from "clsx"
import { Pencil, RotateCcw, UserPlus, UserRoundX, Users } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { PersonPhoto } from "@/components/PersonPhoto"
import {
  type Person,
  type PersonDraft,
  relationshipText,
} from "@/data/peopleTypes"
import { usePeople } from "@/hooks/usePeople"
import { MIN_ACTIVE_PEOPLE } from "@/pages/WhoIsThis/gameConfig"
import { PersonFormDialog } from "./PersonFormDialog"
import { TONES } from "./tokens"
import { SectionCard } from "./ui"

type DialogState = { mode: "add" } | { mode: "edit"; person: Person } | null

/**
 * Caregiver management for the people used by "Who Is This?".
 *
 * Photo, name and relationship are edited here; everything the game shows and
 * says about a person comes from these records.
 */
export function PeopleManager() {
  const { t } = useTranslation()
  const {
    people,
    activePeople,
    isLoading,
    storageAvailable,
    addPerson,
    editPerson,
    setActive,
  } = usePeople()
  const [dialog, setDialog] = useState<DialogState>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)

  const activeCount = activePeople.length
  const shortfall = MIN_ACTIVE_PEOPLE - activeCount

  const handleSave = async (draft: PersonDraft) => {
    if (dialog?.mode === "edit") {
      await editPerson(dialog.person.id, draft)
    } else {
      await addPerson(draft)
    }
    setDialog(null)
  }

  const handleToggleActive = async (person: Person) => {
    setPendingId(person.id)
    try {
      await setActive(person.id, !person.active)
    } finally {
      setPendingId(null)
    }
  }

  const peopleLabelText = t(
    "dashboard.activePeopleCount",
    "{{count}} active {{personOrPeople}}",
    {
      count: activeCount,
      personOrPeople:
        activeCount === 1
          ? t("dashboard.person", "person")
          : t("dashboard.people", "people"),
    },
  )

  return (
    <SectionCard
      title={t("dashboard.peopleManagerTitle", "Who Is This? People")}
      subtitle={t(
        "dashboard.peopleManagerSubtitle",
        "Photos and relationships the memory game uses",
      )}
      icon={Users}
      tone="brand"
      action={
        <button
          type="button"
          onClick={() => setDialog({ mode: "add" })}
          className="tap-target gap-2 rounded-2xl bg-[#6C5CC4] px-4 text-[16px] font-extrabold text-white shadow-md"
        >
          <UserPlus className="h-5 w-5" />
          {t("dashboard.addPerson", "Add Person")}
        </button>
      }
    >
      <div className="space-y-4">
        {/* Active-person count — the number that decides whether the game can run. */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={clsx(
              "inline-flex items-center gap-2 rounded-full border-2 px-3.5 py-1.5 text-[15px] font-extrabold",
              activeCount >= MIN_ACTIVE_PEOPLE
                ? TONES.stable.surface
                : TONES.monitor.surface,
              activeCount >= MIN_ACTIVE_PEOPLE
                ? TONES.stable.border
                : TONES.monitor.border,
              activeCount >= MIN_ACTIVE_PEOPLE
                ? TONES.stable.text
                : TONES.monitor.text,
            )}
          >
            {peopleLabelText}
          </span>
          {people.length > activeCount ? (
            <span
              className="text-[15px] font-semibold"
              style={{ color: "var(--muted)" }}
            >
              {t("dashboard.deactivatedCount", "{{count}} deactivated", {
                count: people.length - activeCount,
              })}
            </span>
          ) : null}
        </div>

        {shortfall > 0 ? (
          <p
            className={clsx(
              "rounded-2xl border-2 px-4 py-3 text-[16px] font-bold",
              TONES.monitor.surface,
              TONES.monitor.border,
              TONES.monitor.text,
            )}
          >
            {t(
              "dashboard.peopleShortfall",
              "Add or activate at least {{count}} more {{personOrPeople}} to play Who Is This?",
              {
                count: shortfall,
                personOrPeople:
                  shortfall === 1
                    ? t("dashboard.person", "person")
                    : t("dashboard.people", "people"),
              },
            )}
          </p>
        ) : null}

        {!storageAvailable ? (
          <p
            className="text-[15px] font-semibold"
            style={{ color: "var(--muted-strong)" }}
          >
            {t(
              "dashboard.noStorageWarning",
              "This device is not saving data locally, so these changes last until the app is closed.",
            )}
          </p>
        ) : null}

        {isLoading ? (
          <p
            className="text-[16px] font-semibold"
            style={{ color: "var(--muted)" }}
          >
            {t("dashboard.loadingPeople", "Loading people…")}
          </p>
        ) : people.length === 0 ? (
          <p
            className="text-[16px] font-semibold"
            style={{ color: "var(--muted)" }}
          >
            {t(
              "dashboard.noPeopleYet",
              "No people yet. Add the family members the patient sees most often.",
            )}
          </p>
        ) : (
          <ul className="space-y-2.5">
            {people.map((person) => (
              <li
                key={person.id}
                className={clsx(
                  "flex flex-wrap items-center gap-3 rounded-2xl border-2 px-3.5 py-3",
                  person.active
                    ? "border-slate-200 dark:border-slate-700"
                    : "border-dashed border-slate-300 opacity-70 dark:border-slate-600",
                )}
                style={{ backgroundColor: "var(--surface)" }}
              >
                <PersonPhoto
                  person={person}
                  alt={t("dashboard.photoOf", "Photo of {{name}}", {
                    name: person.name,
                  })}
                  className="h-14 w-14 rounded-full border-2 border-white shadow-sm dark:border-slate-700"
                  glyphClassName="text-2xl"
                />

                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-[17px] font-extrabold leading-tight"
                    style={{ color: "var(--foreground)" }}
                  >
                    {person.name}
                  </p>
                  {/* Relationship is deliberately secondary to the name. */}
                  <p
                    className="truncate text-[15px] font-semibold leading-snug"
                    style={{ color: "var(--muted-strong)" }}
                  >
                    {t(
                      `relationship.${person.relationship}`,
                      relationshipText(person),
                    )}
                  </p>
                  {!person.active ? (
                    <span
                      className={clsx(
                        "mt-1 inline-flex rounded-full border px-2 py-0.5 text-[12px] font-extrabold uppercase tracking-[0.08em]",
                        TONES.neutral.surface,
                        TONES.neutral.border,
                        TONES.neutral.text,
                      )}
                    >
                      {t("dashboard.inactive", "Inactive")}
                    </span>
                  ) : null}
                </div>

                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => setDialog({ mode: "edit", person })}
                    className="tap-target gap-1.5 rounded-2xl border-2 border-slate-200 px-3.5 text-[15px] font-extrabold dark:border-slate-700"
                    style={{ color: "var(--muted-strong)" }}
                  >
                    <Pencil className="h-4 w-4" />
                    {t("dashboard.edit", "Edit")}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleToggleActive(person)}
                    disabled={pendingId === person.id}
                    className={clsx(
                      "tap-target gap-1.5 rounded-2xl border-2 px-3.5 text-[15px] font-extrabold disabled:opacity-60",
                      person.active
                        ? [
                            TONES.monitor.border,
                            TONES.monitor.surface,
                            TONES.monitor.text,
                          ]
                        : [
                            TONES.stable.border,
                            TONES.stable.surface,
                            TONES.stable.text,
                          ],
                    )}
                  >
                    {person.active ? (
                      <>
                        <UserRoundX className="h-4 w-4" />
                        {t("dashboard.deactivate", "Deactivate")}
                      </>
                    ) : (
                      <>
                        <RotateCcw className="h-4 w-4" />
                        {t("dashboard.reactivate", "Reactivate")}
                      </>
                    )}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {dialog ? (
        <PersonFormDialog
          person={dialog.mode === "edit" ? dialog.person : undefined}
          onCancel={() => setDialog(null)}
          onSave={handleSave}
        />
      ) : null}
    </SectionCard>
  )
}

export default PeopleManager
