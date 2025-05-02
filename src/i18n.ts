import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import your translation files (we'll create these next)
import translationEN from './locales/en/translation.json';
import translationZH from './locales/zh-Hant/translation.json';

const resources = {
  en: {
    translation: translationEN
  },
  'zh-Hant': { // Use 'zh-Hant' for Traditional Chinese
    translation: translationZH
  }
};

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // Init i18next
  .init({
    resources,
    fallbackLng: 'zh-Hant', // Default to Traditional Chinese if detection fails
    debug: import.meta.env.DEV, // Enable debug output in development

    // Language detection options
    detection: {
      // Order and from where user language should be detected
      order: ['localStorage', 'navigator', 'htmlTag'],
      // Cache user language choice in localStorage
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false, // React already safes from xss
    },

    // React-specific options
    react: {
      useSuspense: false // Set to true if using Suspense for loading translations
    }
  });

export default i18n;