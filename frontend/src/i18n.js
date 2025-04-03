import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import sv from './locales/sv';
import en from './locales/en';
import pl from './locales/pl';
import uk from './locales/uk';

// Hämta användarens föredragna språk från localStorage eller använd svenska som standard
const getPreferredLanguage = () => {
  const storedLang = localStorage.getItem('preferred_language');
  return storedLang && ['sv', 'en', 'pl', 'uk'].includes(storedLang) ? storedLang : 'sv';
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      sv: { translation: sv },
      en: { translation: en },
      pl: { translation: pl },
      uk: { translation: uk }
    },
    lng: getPreferredLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React hanterar redan XSS-skydd
    },
    react: {
      useSuspense: false, // För att undvika problem med Suspense
    }
  });

export default i18n; 