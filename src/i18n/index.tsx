import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import translations from "./translations.js";

export type Locale = "en" | "ru" | "kz" | "zhCN" | "zhTW";

type DictValue = string | number | boolean | null | DictObject | DictValue[];
type DictObject = { [key: string]: DictValue };

const STORAGE_KEY = "language";
const DEFAULT_LOCALE: Locale = "en";
const SUPPORTED_LANGS: Locale[] = ["en", "ru", "kz", "zhCN", "zhTW"];

const dictionaries = translations as unknown as Record<Locale, DictObject>;

function interpolate(raw: string, vars?: Record<string, string | number>): string {
  if (!vars) return raw;
  return raw.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => String(vars[key] ?? ""));
}

function getPathValue(dict: DictObject, key: string): DictValue | undefined {
  return key.split(".").reduce<DictValue | undefined>((acc, part) => {
    if (!acc || typeof acc !== "object" || Array.isArray(acc)) return undefined;
    return (acc as DictObject)[part];
  }, dict);
}

export function translate(locale: Locale, key: string, vars?: Record<string, string | number>): string {
  const localValue = getPathValue(dictionaries[locale], key);
  const fallbackValue = getPathValue(dictionaries.en, key);
  const finalValue = localValue ?? fallbackValue;
  if (typeof finalValue === "string") return interpolate(finalValue, vars);
  if (typeof fallbackValue === "string") return interpolate(fallbackValue, vars);
  return key;
}

function isLocale(input: string | null): input is Locale {
  return typeof input === "string" && SUPPORTED_LANGS.includes(input as Locale);
}

const getInitialLanguage = (): Locale => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (isLocale(saved)) return saved;
  if (saved !== null) {
    localStorage.setItem(STORAGE_KEY, DEFAULT_LOCALE);
  }
  return DEFAULT_LOCALE;
};

function toHtmlLang(locale: Locale): string {
  if (locale === "zhCN") return "zh-CN";
  if (locale === "zhTW") return "zh-TW";
  return locale;
}

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(getInitialLanguage);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = toHtmlLang(locale);
  }, [locale]);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key, vars) => translate(locale, key, vars),
    }),
    [locale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
}
