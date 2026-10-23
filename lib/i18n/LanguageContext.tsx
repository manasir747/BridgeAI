'use client';

import React, { createContext, useContext, useEffect, useCallback, useMemo, useSyncExternalStore } from 'react';
import { SupportedLanguage, DEFAULT_LANGUAGE } from '@/types/i18n';
import { getTranslations, formatTemplate, Translations } from './index';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: Translations;
  format: (template: string, params?: Record<string, string | number>) => string;
}

const STORAGE_KEY = 'bridgeai_user_language';

function subscribe(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener('bridgeai_language_change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('bridgeai_language_change', callback);
  };
}

function getSnapshot(): SupportedLanguage {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as SupportedLanguage | null;
    if (saved === 'en' || saved === 'hi' || saved === 'mr') {
      return saved;
    }
  } catch {
    // Best-effort
  }
  return DEFAULT_LANGUAGE;
}

function getServerSnapshot(): SupportedLanguage {
  return DEFAULT_LANGUAGE;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const language = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Synchronize <html> lang attribute with active language
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const setLanguage = useCallback((newLang: SupportedLanguage) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, newLang);
        window.dispatchEvent(new Event('bridgeai_language_change'));
      }
    } catch {
      // Best-effort local storage update
    }
  }, []);

  const currentTranslations = useMemo(() => getTranslations(language), [language]);

  const contextValue = useMemo<LanguageContextType>(
    () => ({
      language,
      setLanguage,
      t: currentTranslations,
      format: formatTemplate,
    }),
    [language, setLanguage, currentTranslations]
  );

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback if rendered outside provider (e.g. isolated test)
    return {
      language: DEFAULT_LANGUAGE,
      setLanguage: () => {},
      t: getTranslations(DEFAULT_LANGUAGE),
      format: formatTemplate,
    };
  }
  return context;
}
