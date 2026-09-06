import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import hi from './locales/hi.json';
import ne from './locales/ne.json';
import as_ from './locales/as.json';
import bn from './locales/bn.json';
import brx from './locales/brx.json';
import mni from './locales/mni.json';
import { DEFAULT_LANGUAGE } from './i18n/langConfig';

/**
 * Every bundle is compiled into the app. Translation happens entirely on-device:
 * no translation API or external service is used at runtime.
 */
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
    ne: { translation: ne },
    as: { translation: as_ },
    bn: { translation: bn },
    brx: { translation: brx },
    mni: { translation: mni },
  },
  lng: localStorage.getItem('language') ?? DEFAULT_LANGUAGE,
  fallbackLng: 'en',
  returnNull: false,
  interpolation: { escapeValue: false },
});

/**
 * Persist the user preference so the next visit starts in the selected language.
 */
i18n.on('languageChanged', (lang) => {
  localStorage.setItem('language', lang);
});

export default i18n;
