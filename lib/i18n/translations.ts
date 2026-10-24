import en from "./locales/en";
import fr from "./locales/fr";
import ar from "./locales/ar";

export type Locale = "en" | "fr" | "ar";

export const LOCALE_META: Record<
  Locale,
  { label: string; dir: "ltr" | "rtl"; nativeName: string }
> = {
  en: { label: "English", dir: "ltr", nativeName: "English" },
  fr: { label: "Fran\u00e7ais", dir: "ltr", nativeName: "Fran\u00e7ais" },
  ar: {
    label: "\u0627\u0644\u0639\u0631\u0628\u064a\u0629",
    dir: "rtl",
    nativeName: "\u0627\u0644\u0639\u0631\u0628\u064a\u0629",
  },
};

export const translations = { en, fr, ar } as const;

export type TranslationKeys = typeof en;
