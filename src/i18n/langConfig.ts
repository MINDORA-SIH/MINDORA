/**
 * Single source of truth for the UI languages supported by the PWA.
 */

export interface LangConfig {
  /** i18next locale code (used as the key too). */
  i18nLocale: string
  /** BCP-47 tag for `SpeechRecognition.lang`. */
  speechRecognitionLang: string
  /** Kept for the existing voice-command integration. */
  ttsVoicePack: string
  webSpeechApiSupported: boolean
}

export const LANG_CONFIG: Record<string, LangConfig> = {
  en: {
    i18nLocale: "en",
    speechRecognitionLang: "en-IN",
    ttsVoicePack: "en-IN",
    webSpeechApiSupported: true,
  },
  hi: {
    i18nLocale: "hi",
    speechRecognitionLang: "hi-IN",
    ttsVoicePack: "hi-IN",
    webSpeechApiSupported: true,
  },
  ne: {
    i18nLocale: "ne",
    speechRecognitionLang: "ne-NP",
    ttsVoicePack: "ne-NP",
    webSpeechApiSupported: false,
  },
  as: {
    i18nLocale: "as",
    speechRecognitionLang: "as-IN",
    ttsVoicePack: "as-IN",
    webSpeechApiSupported: true,
  },
  bn: {
    i18nLocale: "bn",
    speechRecognitionLang: "bn-IN",
    ttsVoicePack: "bn-IN",
    webSpeechApiSupported: true,
  },
  brx: {
    i18nLocale: "brx",
    speechRecognitionLang: "en-IN",
    ttsVoicePack: "brx",
    webSpeechApiSupported: false,
  },
  mni: {
    i18nLocale: "mni",
    speechRecognitionLang: "en-IN",
    ttsVoicePack: "mni",
    webSpeechApiSupported: false,
  },
}

/** Human-readable display metadata for the language selector. */
export interface LanguageMeta {
  code: string
  name: string
  nativeName: string
}

/**
 * Ordered list for the language selector. Labels use the requested native names.
 */
export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "ne", name: "Nepali", nativeName: "नेपाली" },
  { code: "as", name: "Assamese", nativeName: "অসমীয়া" },
  { code: "brx", name: "Bodo", nativeName: "बड़ो" },
  { code: "mni", name: "Meitei", nativeName: "মৈতৈলোন" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
]

/** English is the source and default UI language. */
export const DEFAULT_LANGUAGE = "en"

/** Returns the config for a language code, falling back to English. */
export function getLangConfig(code: string): LangConfig {
  return LANG_CONFIG[code] ?? LANG_CONFIG.en
}
