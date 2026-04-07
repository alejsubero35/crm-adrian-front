import { useLanguage, type AppLanguage } from "@/contexts/LanguageContext";

import es from "./locales/es.json";
import en from "./locales/en.json";
import pt from "./locales/pt.json";

type Vars = Record<string, string | number | boolean | null | undefined>;

type TranslationTables = Record<AppLanguage, unknown>;

const translations: TranslationTables = {
  es,
  en,
  pt,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getByPath(obj: unknown, path: string): unknown {
  if (!isRecord(obj)) return undefined;

  const parts = path.split(".").filter(Boolean);
  let cur: unknown = obj;

  for (const part of parts) {
    if (!isRecord(cur)) return undefined;
    cur = cur[part];
  }

  return cur;
}

function interpolate(template: string, vars?: Vars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const val = vars[key];
    return val === undefined || val === null ? "" : String(val);
  });
}

export function createTranslator(language: AppLanguage) {
  return (key: string, vars?: Vars): string => {
    const table = translations[language] ?? translations.es;
    const raw = getByPath(table, key);

    if (typeof raw === "string") {
      return interpolate(raw, vars);
    }

    const fallback = getByPath(translations.es, key);

    if (process.env.NODE_ENV !== "production" && typeof fallback !== "string") {
      // eslint-disable-next-line no-console
      console.warn(`[i18n] Missing translation key: ${key}`);
    }

    return typeof fallback === "string" ? interpolate(fallback, vars) : key;
  };
}

export function useT(prefix?: string) {
  const { language } = useLanguage();
  const t = createTranslator(language);

  return (key: string, vars?: Vars): string => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    return t(fullKey, vars);
  };
}
