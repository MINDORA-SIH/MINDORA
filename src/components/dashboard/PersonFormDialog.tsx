import { clsx } from "clsx";
import { ImagePlus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PersonPhoto } from "@/components/PersonPhoto";
import {
  CUSTOM_RELATIONSHIP,
  isRelationship,
  type Person,
  type PersonDraft,
  type Relationship,
  RELATIONSHIPS,
} from "@/data/peopleTypes";
import { useTranslation } from "react-i18next";

/** Uploads are downscaled before they are stored, to keep the database small. */
const MAX_PHOTO_EDGE = 512;
const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;

interface PersonFormDialogProps {
  /** Present when editing. The record keeps its id, so history stays attached. */
  person?: Person;
  onCancel: () => void;
  onSave: (draft: PersonDraft) => Promise<void>;
}

const FIELD_LABEL_CLASS = "block text-[15px] font-extrabold";
const FIELD_CLASS =
  "tap-target w-full rounded-2xl border-2 px-4 py-3 text-[17px] font-semibold outline-none focus-visible:border-[#6C5CC4]";

/** Reads a chosen file and shrinks its longest edge to {@link MAX_PHOTO_EDGE}. */
async function readPhotoFile(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("Unreadable file."));
    reader.readAsDataURL(file);
  });
  return downscalePhoto(dataUrl);
}

function downscalePhoto(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      const longestEdge = Math.max(image.width, image.height);
      const scale = longestEdge > 0 ? Math.min(1, MAX_PHOTO_EDGE / longestEdge) : 1;
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);
      const context = canvas.getContext("2d");
      // Vector or unsupported sources are kept as-is rather than dropped.
      if (scale === 1 || !context || canvas.width === 0 || canvas.height === 0) {
        resolve(dataUrl);
        return;
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    image.onerror = () => resolve(dataUrl);
    image.src = dataUrl;
  });
}

/**
 * Add / edit form for one person. Photo, name and relationship are the only
 * caregiver-editable fields; identity and timestamps belong to the repository.
 */
export function PersonFormDialog({ person, onCancel, onSave }: PersonFormDialogProps) {
  const { t } = useTranslation();
  const isEditing = person !== undefined;
  const [name, setName] = useState(person?.name ?? "");
  const [relationship, setRelationship] = useState<Relationship>(
    person?.relationship ?? "Son",
  );
  const [customRelationship, setCustomRelationship] = useState(
    person?.customRelationship ?? "",
  );
  const [photo, setPhoto] = useState(person?.photo ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  const handlePickPhoto = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError(t("peopleManager.errorChooseImage"));
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setError(t("peopleManager.errorImageTooLarge"));
      return;
    }
    try {
      setPhoto(await readPhotoFile(file));
      setError(null);
    } catch {
      setError(t("peopleManager.errorPhotoUnreadable"));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedCustom = customRelationship.trim();

    if (trimmedName.length === 0) {
      setError(t("peopleManager.errorEnterName"));
      nameRef.current?.focus();
      return;
    }
    if (relationship === CUSTOM_RELATIONSHIP && trimmedCustom.length === 0) {
      setError(t("peopleManager.errorDescribeRelationship"));
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await onSave({
        name: trimmedName,
        relationship,
        photo,
        ...(relationship === CUSTOM_RELATIONSHIP ? { customRelationship: trimmedCustom } : {}),
      });
    } catch {
      setError(t("peopleManager.errorSaveFailed"));
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[150] flex items-end justify-center bg-slate-900/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={() => {
        if (!isSaving) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="person-form-title"
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border-2 border-slate-200 shadow-2xl sm:rounded-3xl dark:border-slate-700"
        style={{ backgroundColor: "var(--card-bg)" }}
        onClick={(event) => event.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <h2
              id="person-form-title"
              className="text-xl font-extrabold"
              style={{ color: "var(--foreground)" }}
            >
              {isEditing ? t("peopleManager.editPerson") : t("peopleManager.addPerson")}
            </h2>
            <button
              type="button"
              onClick={onCancel}
              aria-label={t("common.close")}
              className="tap-target -mr-1 -mt-1 rounded-full border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              style={{ color: "var(--muted)" }}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Photo */}
          <div className="space-y-2">
            <span className={FIELD_LABEL_CLASS} style={{ color: "var(--foreground)" }}>
              {t("peopleManager.photo")}
            </span>
            <div className="flex items-center gap-4">
              <PersonPhoto
                person={{ name: name.trim() || "?", photo, emoji: person?.emoji, color: person?.color }}
                alt={photo ? t("peopleManager.selectedPhoto") : t("peopleManager.noPhotoChosen")}
                className="h-20 w-20 rounded-2xl border-2 border-slate-200 dark:border-slate-700"
                glyphClassName="text-3xl"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="tap-target gap-2 rounded-2xl border-2 border-[#D6CBF5] bg-[#F5F2FF] px-4 text-[16px] font-extrabold text-[#5044A8] dark:border-[#44386B] dark:bg-[#251F3D] dark:text-[#C4B5FD]"
                >
                  <ImagePlus className="h-5 w-5" />
                  {photo ? t("peopleManager.changePhoto") : t("peopleManager.uploadPhoto")}
                </button>
                {photo ? (
                  <button
                    type="button"
                    onClick={() => setPhoto("")}
                    className="tap-target rounded-2xl border-2 border-slate-200 px-4 text-[16px] font-extrabold dark:border-slate-700"
                    style={{ color: "var(--muted-strong)" }}
                  >
                    {t("peopleManager.removePhoto")}
                  </button>
                ) : null}
              </div>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                void handlePickPhoto(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
          </div>

          {/* Name */}
          <div className="space-y-2">
            <label
              htmlFor="person-name"
              className={FIELD_LABEL_CLASS}
              style={{ color: "var(--foreground)" }}
            >
              {t("peopleManager.name")}
            </label>
            <input
              id="person-name"
              ref={nameRef}
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t("peopleManager.namePlaceholder")}
              autoComplete="off"
              className={clsx(FIELD_CLASS, "border-slate-200 dark:border-slate-700")}
              style={{ backgroundColor: "var(--surface)", color: "var(--foreground)" }}
            />
          </div>

          {/* Relationship */}
          <div className="space-y-2">
            <label
              htmlFor="person-relationship"
              className={FIELD_LABEL_CLASS}
              style={{ color: "var(--foreground)" }}
            >
              {t("peopleManager.relationship")}
            </label>
            <select
              id="person-relationship"
              value={relationship}
              onChange={(event) => {
                const next = event.target.value;
                if (isRelationship(next)) setRelationship(next);
              }}
              className={clsx(FIELD_CLASS, "border-slate-200 dark:border-slate-700")}
              style={{ backgroundColor: "var(--surface)", color: "var(--foreground)" }}
            >
              {RELATIONSHIPS.map((option) => (
                <option key={option} value={option}>
                  {t(`relationships.${option.toLowerCase()}`, { defaultValue: option })}
                </option>
              ))}
            </select>
            {relationship === CUSTOM_RELATIONSHIP ? (
              <input
                type="text"
                value={customRelationship}
                onChange={(event) => setCustomRelationship(event.target.value)}
                placeholder={t("peopleManager.customRelationshipPlaceholder")}
                aria-label={t("peopleManager.customRelationship")}
                autoComplete="off"
                className={clsx(FIELD_CLASS, "border-[#D6CBF5] dark:border-[#44386B]")}
                style={{ backgroundColor: "var(--surface)", color: "var(--foreground)" }}
              />
            ) : null}
          </div>

          {error ? (
            <p
              role="alert"
              className="rounded-2xl border-2 border-[#F0BDBD] bg-[#FDEEEE] px-4 py-2.5 text-[15px] font-bold text-[#A32E2E] dark:border-[#6B2B2B] dark:bg-[#3B1A1A] dark:text-[#F6A5A5]"
            >
              {error}
            </p>
          ) : null}

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              className="tap-target rounded-2xl border-2 border-slate-200 px-5 text-[17px] font-extrabold disabled:opacity-60 dark:border-slate-700"
              style={{ color: "var(--muted-strong)" }}
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="tap-target rounded-2xl bg-[#6C5CC4] px-6 text-[17px] font-extrabold text-white shadow-md disabled:opacity-60"
            >
              {isSaving ? t("dailyRoutine.saving") : t("common.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PersonFormDialog;
