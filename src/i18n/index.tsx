import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import en from "./en.json";
import zhCN from "./zh-CN.json";
import zhHK from "./zh-HK.json";
import kz from "./kz.json";

export type Locale = "en" | "zh-CN" | "zh-HK" | "kz";

type DictValue = string | number | boolean | null | DictObject | DictValue[];
type DictObject = { [key: string]: DictValue };

const STORAGE_KEY = "stocksense.locale";
const DEFAULT_LOCALE: Locale = "en";

const dictionaries: Record<Locale, DictObject> = {
  en: en as DictObject,
  "zh-CN": zhCN as DictObject,
  "zh-HK": zhHK as DictObject,
  kz: kz as DictObject,
};

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
  return input === "en" || input === "zh-CN" || input === "zh-HK" || input === "kz";
}

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return isLocale(stored) ? stored : DEFAULT_LOCALE;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale;
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
