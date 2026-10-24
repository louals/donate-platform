"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { Locale, LOCALE_META, translations } from "./translations";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (typeof translations)[Locale];
  dir: "ltr" | "rtl";
  isRTL: boolean;
  meta: (typeof LOCALE_META)[Locale];
}

// Default context value for SSR — uses French as the default
const defaultContext: LanguageContextType = {
  locale: "fr",
  setLocale: () => { },
  t: translations.fr,
  dir: "ltr",
  isRTL: false,
  meta: LOCALE_META.fr,
};

const LanguageContext = createContext<LanguageContextType>(defaultContext);

const STORAGE_KEY = "Donate-locale";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("fr");

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (stored && translations[stored]) {
        setLocaleState(stored);
      }
    } catch {
      // SSR / localStorage not available — ignore
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
    } catch {
      // SSR fallback
    }
  }, []);

  const t = translations[locale];
  const meta = LOCALE_META[locale];
  const dir = meta.dir;
  const isRTL = dir === "rtl";

  // Update HTML attributes when locale changes
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);

  return (
    <LanguageContext.Provider
      value={{ locale, setLocale, t, dir, isRTL, meta }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
