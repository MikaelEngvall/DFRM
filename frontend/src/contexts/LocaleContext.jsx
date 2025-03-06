import React, { createContext, useContext, useState, useEffect } from 'react';
import sv from '../locales/sv';
import en from '../locales/en';
import pl from '../locales/pl';
import uk from '../locales/uk';

const STORAGE_KEY = 'preferred_language';
const DEFAULT_LOCALE = 'sv';

const AVAILABLE_LOCALES = {
  sv: { name: 'Svenska', translations: sv },
  en: { name: 'English', translations: en },
  pl: { name: 'Polski', translations: pl },
  uk: { name: 'Українська', translations: uk },
};

const detectBrowserLanguage = () => {
  const languages = navigator.languages || [navigator.language || navigator.userLanguage];
  
  for (const lang of languages) {
    const code = lang.split('-')[0].toLowerCase();
    if (AVAILABLE_LOCALES[code]) {
      return code;
    }
  }

  // Fallback till engelska om inget matchande språk hittas
  return 'en';
};

const LocaleContext = createContext();

export const LocaleProvider = ({ children }) => {
  const [currentLocale, setCurrentLocale] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && AVAILABLE_LOCALES[stored]) {
      return stored;
    }
    return detectBrowserLanguage();
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, currentLocale);
    document.documentElement.lang = currentLocale;
    
    // Sätt rätt textflödesriktning (för framtida RTL-stöd)
    document.documentElement.dir = currentLocale === 'ar' ? 'rtl' : 'ltr';
  }, [currentLocale]);

  const t = (path, params = {}) => {
    const translations = AVAILABLE_LOCALES[currentLocale].translations;
    const keys = path.split('.');
    let value = translations;

    for (const key of keys) {
      if (!value[key]) {
        console.warn(`Translation missing for key: ${path} in locale: ${currentLocale}`);
        // Försök med engelska som fallback
        if (currentLocale !== 'en') {
          const enValue = path.split('.').reduce((acc, k) => acc?.[k], AVAILABLE_LOCALES.en.translations);
          return typeof enValue === 'string' ? enValue : path;
        }
        return path;
      }
      value = value[key];
    }

    if (typeof value === 'string') {
      return Object.entries(params).reduce((acc, [key, val]) => {
        if (key === 'plural') {
          const pluralKey = val === 1 ? 'one' : 'other';
          const matches = acc.match(new RegExp(`{${key}, plural, one {([^}]*)} other {([^}]*)}}`, 'g'));
          if (matches) {
            const parts = matches[0].match(/{([^}]*)}/g);
            return acc.replace(matches[0], parts[pluralKey === 'one' ? 1 : 2].slice(1, -1));
          }
        }
        return acc.replace(`{${key}}`, val);
      }, value);
    }

    return value;
  };

  const changeLocale = (locale) => {
    if (AVAILABLE_LOCALES[locale]) {
      setCurrentLocale(locale);
    }
  };

  return (
    <LocaleContext.Provider 
      value={{ 
        t,
        currentLocale,
        changeLocale,
        availableLocales: AVAILABLE_LOCALES,
      }}
    >
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale måste användas inom en LocaleProvider');
  }
  return context;
};

export default LocaleContext; 