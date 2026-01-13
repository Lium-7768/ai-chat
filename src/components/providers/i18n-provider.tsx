'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Language, getTranslation } from '@/lib/i18n';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string, params?: Record<string, string>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

function getInitialLanguage(): Language {
  if (typeof window === 'undefined') {
    return 'zh';
  }
  const savedLang = localStorage.getItem('language') as Language;
  if (savedLang === 'en' || savedLang === 'zh') {
    return savedLang;
  }
  return 'zh';
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  }, []);

  const t = useCallback(
    (path: string, params?: Record<string, string>) => {
      return getTranslation(language, path, params);
    },
    [language]
  );

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>{children}</I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
