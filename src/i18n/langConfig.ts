/**
 * Single source of truth for every language the patient PWA supports.
 *
 * All three dependent systems read from this config — never hard-code a
 * language code elsewhere:
 *   a) i18next locale  → drives UI text rendering
 *   b) SpeechRecognition.lang (BCP-47) → drives Web Speech API voice input
 *   c) Coqui TTS WASM voice pack identifier → drives offline speech output
 *
 * FastText WASM is intentionally SEPARATE: it detects incoming voice dialect
 * for ASR routing decisions and does NOT drive the UI locale. The two are
 * independent subsystems.
 */

export interface LangConfig {
  /** i18next locale code (used as the key too). */
  i18nLocale: string;
  /** BCP-47 tag for `SpeechRecognition.lang`. */
  speechRecognitionLang: string;
  /** Coqui TTS WASM voice pack identifier. */
  ttsVoicePack: string;
  /** AI4Bharat IndicWhisper code — online-only fallback for ASR routing. */
  indicWhisperLang?: string;
  /** Whether Chrome supports this lang natively via Web Speech API. */
  webSpeechApiSupported: boolean;
}

export const LANG_CONFIG: Record<string, LangConfig> = {
  en: {
    i18nLocale: 'en',
    speechRecognitionLang: 'en-IN',
    ttsVoicePack: 'en-IN',
    webSpeechApiSupported: true,
  },
  hi: {
    i18nLocale: 'hi',
    speechRecognitionLang: 'hi-IN',
    ttsVoicePack: 'hi-IN',
    indicWhisperLang: 'hi',
    webSpeechApiSupported: true,
  },
  ne: {
    i18nLocale: 'ne',
    speechRecognitionLang: 'ne-NP',
    ttsVoicePack: 'ne-NP',
    indicWhisperLang: 'ne',
    webSpeechApiSupported: false,
  },
  as: {
    i18nLocale: 'as',
    speechRecognitionLang: 'as-IN',
    ttsVoicePack: 'as-IN',
    indicWhisperLang: 'as',
    webSpeechApiSupported: true,
  },
  bn: {
    i18nLocale: 'bn',
    speechRecognitionLang: 'bn-IN',
    ttsVoicePack: 'bn-IN',
    indicWhisperLang: 'bn',
    webSpeechApiSupported: true,
  },
  brx: {
    i18nLocale: 'brx',
    speechRecognitionLang: 'en-IN',
    ttsVoicePack: 'brx',
    indicWhisperLang: 'brx',
    webSpeechApiSupported: false,
  },
  mni: {
    i18nLocale: 'mni',
    speechRecognitionLang: 'en-IN',
    ttsVoicePack: 'mni',
    indicWhisperLang: 'mni',
    webSpeechApiSupported: false,
  },
  lus: {
    i18nLocale: 'lus',
    speechRecognitionLang: 'en-IN',
    ttsVoicePack: 'lus',
    webSpeechApiSupported: false,
  },
  kha: {
    i18nLocale: 'kha',
    speechRecognitionLang: 'en-IN',
    ttsVoicePack: 'kha',
    webSpeechApiSupported: false,
  },
  trp: {
    i18nLocale: 'trp',
    speechRecognitionLang: 'en-IN',
    ttsVoicePack: 'trp',
    webSpeechApiSupported: false,
  },
};

/** Human-readable display metadata for the language selector. */
export interface LanguageMeta {
  code: string;
  name: string;
  nativeName: string;
  /** True for the static (human-authored) translation track. */
  isStaticTrack: boolean;
  /** Optional FLORES-200 code for reference only. */
  floresCode?: string;
  /** Optional target script label. */
  script?: string;
}

/**
 * Ordered list for the LanguageSelector. `code` matches `LANG_CONFIG` keys and
 * the i18next locale. Labels are shown in the native script only.
 */
export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  { code: 'en', name: 'English', nativeName: 'English', isStaticTrack: false, floresCode: 'eng_Latn', script: 'Latin' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', isStaticTrack: false, floresCode: 'hin_Deva', script: 'Devanagari' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', isStaticTrack: false, floresCode: 'npi_Deva', script: 'Devanagari' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', isStaticTrack: false, floresCode: 'asm_Beng', script: 'Bengali' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', isStaticTrack: false, floresCode: 'ben_Beng', script: 'Bengali' },
  { code: 'brx', name: 'Bodo', nativeName: 'बड़ो', isStaticTrack: false, floresCode: 'brx_Deva', script: 'Devanagari' },
  { code: 'mni', name: 'Meitei', nativeName: 'ꯃꯤꯇꯩ ꯂꯣꯟ', isStaticTrack: false, floresCode: 'mni_Mtei', script: 'Meitei' },
  { code: 'lus', name: 'Mizo', nativeName: 'Mizo', isStaticTrack: true, floresCode: 'lus_Latn', script: 'Latin' },
  { code: 'kha', name: 'Khasi', nativeName: 'Khasi', isStaticTrack: true, floresCode: 'kha_Latn', script: 'Latin' },
  { code: 'trp', name: 'Kokborok', nativeName: 'Kokborok', isStaticTrack: true, floresCode: 'trp_Beng', script: 'Bengali' },
];

/** Default language per spec: Assamese. */
export const DEFAULT_LANGUAGE = 'as';

/** Returns the config for a language code, falling back to English. */
export function getLangConfig(code: string): LangConfig {
  return LANG_CONFIG[code] ?? LANG_CONFIG.en;
}
