import { useEffect, useState } from "react"
import type { Person } from "@/data/peopleTypes"

/** Only the fields a photo needs, so unsaved form drafts can preview too. */
export type PersonAvatar = Pick<Person, "name" | "photo"> & Partial<Pick<Person, "emoji" | "color">>

interface PersonPhotoProps {
  person: PersonAvatar
  /**
   * Alt text. Pass a neutral description wherever naming the person would give
   * away a game answer.
   */
  alt: string
  /** Frame size, rounding and border — the photo is clipped to it. */
  className?: string
  /** Size of the fallback glyph shown when the photo cannot be loaded. */
  glyphClassName?: string
}

/**
 * A person's photo with a graceful fallback: if the image is missing or fails
 * to load, a tinted avatar glyph takes its place so the layout never breaks.
 *
 * Shared by the caregiver list and the games, so a photo looks the same
 * everywhere it appears.
 */
export function PersonPhoto({
  person,
  alt,
  className = "h-16 w-16 rounded-full border-2 border-white shadow-sm",
  glyphClassName = "text-3xl",
}: PersonPhotoProps) {
  const [failed, setFailed] = useState(false)

  // A caregiver can replace the photo while this component stays mounted.
  useEffect(() => {
    setFailed(false)
  }, [person.photo])

  const tint = `${person.color ?? "#FF6584"}22`
  const showImage = person.photo.length > 0 && !failed

  return (
    <span
      className={`grid shrink-0 place-items-center overflow-hidden ${className}`}
      style={{ backgroundColor: tint }}
    >
      {showImage ? (
        <img
          src={person.photo}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span
          className={`select-none leading-none ${glyphClassName}`}
          role="img"
          aria-label={alt}
        >
          {person.emoji ?? person.name.charAt(0).toUpperCase()}
        </span>
      )}
    </span>
  )
}

export default PersonPhoto
