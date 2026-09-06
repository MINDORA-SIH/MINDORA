import { Check, ChevronDown, Globe } from "lucide-react"
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
} from "react"
import { clsx } from "clsx"
import { useTranslation } from "react-i18next"
import { SUPPORTED_LANGUAGES } from "../i18n/langConfig"

export interface Language {
  code: string
  name: string
  nativeName: string
}

/**
 * UI locale list. The parent changes i18next when a user picks an entry.
 */
export const LANGUAGES: Language[] = SUPPORTED_LANGUAGES.map(
  ({ code, name, nativeName }) => ({ code, name, nativeName }),
)

export const DEFAULT_LANGUAGE: Language = LANGUAGES[0]

interface LanguageDropdownProps {
  value: Language
  onChange: (language: Language) => void
  /** Controlled so a caller can keep at most one popup open at a time. */
  open: boolean
  onOpenChange: (open: boolean) => void
  /** `sm` is the compact header pill, `lg` the roomier Settings control. */
  size?: "sm" | "lg"
  /** Trigger edge the menu lines up with. */
  align?: "start" | "end"
  className?: string
}

export function LanguageDropdown({
  value,
  onChange,
  open,
  onOpenChange,
  size = "sm",
  align = "start",
  className,
}: LanguageDropdownProps) {
  const { t } = useTranslation()
  const listboxId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([])
  const isLarge = size === "lg"

  /*
   * The Settings row wraps on narrow screens, which drags the trigger from the
   * right edge over to the left. Flip the menu to whichever side still fits so
   * it never lands under `main`'s horizontal clip.
   */
  const [resolvedAlign, setResolvedAlign] = useState(align)

  useLayoutEffect(() => {
    const trigger = triggerRef.current
    const menu = menuRef.current
    if (!open || !trigger || !menu) {
      setResolvedAlign(align)
      return
    }
    const rect = trigger.getBoundingClientRect()
    const width = menu.offsetWidth
    const gutter = 8
    if (align === "end" && rect.right - width < gutter)
      setResolvedAlign("start")
    else if (
      align === "start" &&
      rect.left + width > window.innerWidth - gutter
    )
      setResolvedAlign("end")
    else setResolvedAlign(align)
  }, [open, align])

  // Dismiss when a press lands outside the dropdown.
  useEffect(() => {
    if (!open) return
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) onOpenChange(false)
    }
    document.addEventListener("pointerdown", handlePointerDown)
    return () => document.removeEventListener("pointerdown", handlePointerDown)
  }, [open, onOpenChange])

  // Land focus on the current choice so the list is usable from the keyboard.
  useEffect(() => {
    if (!open) return
    const index = LANGUAGES.findIndex(
      (language) => language.code === value.code,
    )
    optionRefs.current[Math.max(index, 0)]?.focus()
  }, [open])

  const close = (returnFocus: boolean) => {
    onOpenChange(false)
    if (returnFocus) triggerRef.current?.focus()
  }

  const moveFocus = (index: number) => optionRefs.current[index]?.focus()

  const handleOptionKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp": {
        event.preventDefault()
        const step = event.key === "ArrowDown" ? 1 : -1
        moveFocus((index + step + LANGUAGES.length) % LANGUAGES.length)
        break
      }
      case "Home":
        event.preventDefault()
        moveFocus(0)
        break
      case "End":
        event.preventDefault()
        moveFocus(LANGUAGES.length - 1)
        break
      case "Escape":
        event.preventDefault()
        close(true)
        break
    }
  }

  // Tabbing or clicking away closes the menu without yanking focus back.
  const handleFocusOut = (event: FocusEvent<HTMLDivElement>) => {
    if (open && !event.currentTarget.contains(event.relatedTarget))
      onOpenChange(false)
  }

  return (
    <div
      ref={rootRef}
      onBlur={handleFocusOut}
      className={clsx("relative flex", className)}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={() => onOpenChange(!open)}
        onKeyDown={(event) => {
          if (!open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
            event.preventDefault()
            onOpenChange(true)
          }
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-label={t("accessibility.languageCurrent", {
          language: value.name,
        })}
        className={clsx(
          "rounded-full border-2 border-purple-200 font-bold shadow-sm transition-all cursor-pointer",
          "hover:border-purple-400 hover:shadow-md active:scale-[0.98]",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500",
          isLarge
            ? "h-12 gap-2.5 px-4 text-base sm:h-14 sm:px-5 sm:text-lg md:text-xl"
            : "h-8 gap-1.5 px-2.5 text-xs sm:h-9 sm:px-3 sm:text-sm",
        )}
        style={{
          backgroundColor: "var(--surface)",
          color: "var(--foreground)",
        }}
      >
        <Globe
          size={isLarge ? 22 : 14}
          className="flex-shrink-0 text-purple-600 dark:text-purple-300"
        />
        <span className="truncate">{value.name}</span>
        <ChevronDown
          size={isLarge ? 20 : 14}
          className={clsx(
            "flex-shrink-0 text-purple-500 transition-transform duration-200 dark:text-purple-300",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div
          ref={menuRef}
          className={clsx(
            "dropdown-pop absolute top-full z-[60] mt-2 max-w-[calc(100vw-1rem)] rounded-3xl border-2 shadow-2xl",
            resolvedAlign === "end" ? "right-0" : "left-0",
            isLarge ? "w-72 sm:w-80" : "w-60 sm:w-72",
          )}
          style={{
            backgroundColor: "var(--surface)",
            borderColor: "var(--border)",
          }}
        >
          <div
            id={listboxId}
            role="listbox"
            aria-label={t("accessibility.langSelectLabel")}
            className="flex max-h-[min(70vh,30rem)] flex-col gap-1 overflow-y-auto overscroll-contain p-2"
          >
            {LANGUAGES.map((language, index) => {
              const isSelected = language.code === value.code
              return (
                <button
                  key={language.code}
                  ref={(node) => {
                    optionRefs.current[index] = node
                  }}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(language)
                    close(true)
                  }}
                  onKeyDown={(event) => handleOptionKeyDown(event, index)}
                  className={clsx(
                    "w-full cursor-pointer gap-3 rounded-2xl border-2 px-3 py-2 text-left transition-colors",
                    "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-purple-500",
                    isSelected
                      ? "border-purple-400 bg-purple-500/12"
                      : "border-transparent hover:bg-purple-500/10",
                  )}
                >
                  {/*
                   * index.css force-centers every button from outside a cascade
                   * layer, so `justify-between` would lose. Growing the label
                   * instead pushes the checkmark to the edge either way.
                   */}
                  <span className="min-w-0 flex-1">
                    <span
                      className={clsx(
                        "block truncate font-extrabold",
                        isLarge
                          ? "text-base sm:text-lg"
                          : "text-sm sm:text-base",
                        isSelected
                          ? "text-purple-700 dark:text-purple-200"
                          : "text-slate-800",
                      )}
                    >
                      {language.name}
                    </span>
                    <span
                      className={clsx(
                        "block truncate font-bold",
                        isLarge ? "text-sm sm:text-base" : "text-xs sm:text-sm",
                        isSelected
                          ? "text-purple-600 dark:text-purple-300"
                          : "text-slate-500 dark:text-slate-400",
                      )}
                    >
                      {language.nativeName}
                    </span>
                  </span>
                  {isSelected && (
                    <span
                      aria-hidden="true"
                      className={clsx(
                        "grid flex-shrink-0 place-items-center rounded-full bg-purple-600",
                        isLarge ? "h-8 w-8" : "h-6 w-6",
                      )}
                    >
                      <Check
                        size={isLarge ? 18 : 14}
                        strokeWidth={3}
                        className="text-white"
                      />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default LanguageDropdown
