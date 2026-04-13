import { useSyncExternalStore } from "react";
import en from "../locales/en.json";
import zhCN from "../locales/zh-CN.json";

type Primitive = string | number | boolean | null | undefined;
type TranslationParams = Record<string, Primitive>;
interface LocaleMessages {
    [key: string]: string | LocaleMessages;
}
type SupportedLocale = "en" | "zh-CN";

const messages: Record<SupportedLocale, LocaleMessages> = {
    en,
    "zh-CN": zhCN,
};

const storageKey = "waveterm:locale";
const listeners = new Set<() => void>();
const defaultLocale: SupportedLocale = "zh-CN";

let currentLocale: SupportedLocale = resolveInitialLocale();

function resolveInitialLocale(): SupportedLocale {
    const storedLocale = readStoredLocale();
    if (storedLocale) {
        return storedLocale;
    }

    const browserLocales = typeof navigator !== "undefined" ? navigator.languages ?? [navigator.language] : [];
    for (const locale of browserLocales) {
        const normalized = normalizeLocale(locale);
        if (normalized) {
            return normalized;
        }
    }

    return defaultLocale;
}

function readStoredLocale(): SupportedLocale | null {
    if (typeof window === "undefined") {
        return null;
    }
    try {
        return normalizeLocale(window.localStorage.getItem(storageKey));
    } catch {
        return null;
    }
}

function normalizeLocale(locale: string | null | undefined): SupportedLocale | null {
    if (!locale) {
        return null;
    }

    const normalized = locale.toLowerCase();
    if (normalized === "zh-cn" || normalized.startsWith("zh")) {
        return "zh-CN";
    }
    if (normalized === "en" || normalized.startsWith("en-")) {
        return "en";
    }

    return null;
}

function resolveMessage(locale: SupportedLocale, key: string): string | null {
    const segments = key.split(".");
    let value: string | LocaleMessages = messages[locale];

    for (const segment of segments) {
        if (value == null || typeof value === "string" || !(segment in value)) {
            return null;
        }
        value = value[segment];
    }

    return typeof value === "string" ? value : null;
}

function interpolate(template: string, params?: TranslationParams): string {
    if (!params) {
        return template;
    }
    return template.replace(/\{\{(\w+)\}\}/g, (_, token) => String(params[token] ?? ""));
}

function updateDocumentLanguage(locale: SupportedLocale) {
    if (typeof document === "undefined") {
        return;
    }
    document.documentElement.lang = locale;
}

function notifyListeners() {
    listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

export function initI18n(locale?: string) {
    const normalizedLocale = normalizeLocale(locale);
    if (normalizedLocale) {
        currentLocale = normalizedLocale;
    }
    updateDocumentLanguage(currentLocale);
}

export function getLocale(): SupportedLocale {
    return currentLocale;
}

export function setLocale(locale: string) {
    const normalizedLocale = normalizeLocale(locale);
    if (!normalizedLocale || normalizedLocale === currentLocale) {
        return;
    }

    currentLocale = normalizedLocale;
    if (typeof window !== "undefined") {
        try {
            window.localStorage.setItem(storageKey, normalizedLocale);
        } catch {
            // Ignore storage failures and keep the in-memory locale.
        }
    }
    updateDocumentLanguage(normalizedLocale);
    notifyListeners();
}

export function t(key: string, params?: TranslationParams, fallbackText?: string): string {
    const message = resolveMessage(currentLocale, key) ?? resolveMessage("en", key) ?? fallbackText ?? key;
    return interpolate(message, params);
}

export function useTranslation() {
    const locale = useSyncExternalStore(subscribe, getLocale, getLocale);
    return {
        locale,
        setLocale,
        t,
    };
}

initI18n();
