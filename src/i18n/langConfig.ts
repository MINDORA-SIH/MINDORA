/** Shared locale, speech, and display metadata. Locale codes are i18next keys. */
export interface LangConfig {
  i18nLocale: string;
  speechRecognitionLang: string;
  ttsVoicePack: string;
  indicWhisperLang?: string;
  webSpeechApiSupported: boolean;
}

export const LANG_CONFIG: Record<string, LangConfig> = {
  en: { i18nLocale: "en", speechRecognitionLang: "en-IN", ttsVoicePack: "en-IN", webSpeechApiSupported: true },
  hi: { i18nLocale: "hi", speechRecognitionLang: "hi-IN", ttsVoicePack: "hi-IN", indicWhisperLang: "hi", webSpeechApiSupported: true },
  ne: { i18nLocale: "ne", speechRecognitionLang: "ne-NP", ttsVoicePack: "ne-NP", indicWhisperLang: "ne", webSpeechApiSupported: false },
  as: { i18nLocale: "as", speechRecognitionLang: "as-IN", ttsVoicePack: "as-IN", indicWhisperLang: "as", webSpeechApiSupported: true },
  bn: { i18nLocale: "bn", speechRecognitionLang: "bn-IN", ttsVoicePack: "bn-IN", indicWhisperLang: "bn", webSpeechApiSupported: true },
  brx: { i18nLocale: "brx", speechRecognitionLang: "en-IN", ttsVoicePack: "brx", indicWhisperLang: "brx", webSpeechApiSupported: false },
  mni: { i18nLocale: "mni", speechRecognitionLang: "en-IN", ttsVoicePack: "mni", indicWhisperLang: "mni", webSpeechApiSupported: false },
  lus: { i18nLocale: "lus", speechRecognitionLang: "en-IN", ttsVoicePack: "lus", webSpeechApiSupported: false },
  kha: { i18nLocale: "kha", speechRecognitionLang: "en-IN", ttsVoicePack: "kha", webSpeechApiSupported: false },
  trp: { i18nLocale: "trp", speechRecognitionLang: "en-IN", ttsVoicePack: "trp", webSpeechApiSupported: false },
};

export interface LanguageMeta {
  code: string;
  name: string;
  nativeName: string;
  isStaticTrack: boolean;
  floresCode?: string;
  script?: string;
}

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  { code: "en", name: "English", nativeName: "English", isStaticTrack: true, floresCode: "eng_Latn", script: "Latin" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", isStaticTrack: true, floresCode: "hin_Deva", script: "Devanagari" },
  { code: "as", name: "Assamese", nativeName: "অসমীয়া", isStaticTrack: true, floresCode: "asm_Beng", script: "Bengali" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", isStaticTrack: false, floresCode: "ben_Beng", script: "Bengali" },
  { code: "ne", name: "Nepali", nativeName: "नेपाली", isStaticTrack: false, floresCode: "npi_Deva", script: "Devanagari" },
  { code: "brx", name: "Bodo", nativeName: "बड़ो", isStaticTrack: false, floresCode: "brx_Deva", script: "Devanagari" },
  { code: "mni", name: "Meitei", nativeName: "ꯃꯤꯇꯩ ꯂꯣꯟ", isStaticTrack: false, floresCode: "mni_Mtei", script: "Meitei" },
  { code: "lus", name: "Mizo", nativeName: "Mizo", isStaticTrack: false, floresCode: "lus_Latn", script: "Latin" },
  { code: "kha", name: "Khasi", nativeName: "Khasi", isStaticTrack: false, floresCode: "kha_Latn", script: "Latin" },
  { code: "trp", name: "Kokborok", nativeName: "Kokborok", isStaticTrack: false, floresCode: "trp_Beng", script: "Bengali" }
];

/** Assamese is the first-run locale. */
export const DEFAULT_LANGUAGE = "as";

export function getLangConfig(code: string): LangConfig {
  return LANG_CONFIG[code] ?? LANG_CONFIG.en;
}
