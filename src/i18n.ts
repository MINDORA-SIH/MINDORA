import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import hi from './locales/hi.json';
import ne from './locales/ne.json';
import as_ from './locales/as.json';
import bn from './locales/bn.json';
import brx from './locales/brx.json';
import mni from './locales/mni.json';
import lus from './locales/lus.json';
import kha from './locales/kha.json';
import trp from './locales/trp.json';
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from './i18n/langConfig';

type LocaleBundle = Record<string, unknown>;

/**
 * Older dashboard copy was stored under `caregiver`, while dashboard components
 * correctly request `dashboard.*`. Keep the legacy keys as a compatibility
 * source, then let a locale's dedicated dashboard keys take precedence.
 */
function withDashboardNamespace(bundle: LocaleBundle): LocaleBundle {
  const caregiver = (bundle.caregiver as Record<string, unknown> | undefined) ?? {};
  const dashboard = (bundle.dashboard as Record<string, unknown> | undefined) ?? {};
  return { ...bundle, dashboard: { ...caregiver, ...dashboard } };
}

/**
 * Only trust a persisted locale that is actually supported. Stale or corrupt
 * localStorage values (e.g. legacy codes like "hin") would otherwise resolve to
 * a language the dropdown cannot display.
 */
function resolveInitialLanguage(): string {
  const stored = localStorage.getItem('app_user_language');
  return SUPPORTED_LANGUAGES.some((language) => language.code === stored)
    ? (stored as string)
    : DEFAULT_LANGUAGE;
}

/**
 * Bootstraps i18next with all pre-generated locale bundles.
 *
 * 100% offline: every locale JSON is bundled by Vite at build time. The runtime
 * never calls a translation model or backend API. The machine track (IndicTrans2)
 * runs only at build time; the static track ships English fallback until a human
 * reviewer commits a reviewed translation.
 */
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: withDashboardNamespace(en) },
    hi: { translation: withDashboardNamespace(hi) },
    ne: { translation: withDashboardNamespace(ne) },
    as: { translation: withDashboardNamespace(as_) },
    bn: { translation: withDashboardNamespace(bn) },
    brx: { translation: withDashboardNamespace(brx) },
    mni: { translation: withDashboardNamespace(mni) },
    lus: { translation: withDashboardNamespace(lus) },
    kha: { translation: withDashboardNamespace(kha) },
    trp: { translation: withDashboardNamespace(trp) },
  },
  lng: resolveInitialLanguage(),
  fallbackLng: 'en',
  returnNull: false,
  interpolation: { escapeValue: false },
});

/**
 * On every language change, persist the choice and notify all dependent
 * subsystems (Web Speech API + Coqui TTS WASM) via a single custom event.
 * `useLanguageSync` listens for this event.
 */
i18n.on('languageChanged', (lang) => {
  localStorage.setItem('app_user_language', lang);
  // Keep assistive tech (screen readers, font shaping) in sync with the UI.
  document.documentElement.lang = lang;
  window.dispatchEvent(new CustomEvent('memoSaathiLangChange', { detail: lang }));
});

// Apply the initial locale before the first paint as well.
document.documentElement.lang = i18n.language;

export default i18n;
