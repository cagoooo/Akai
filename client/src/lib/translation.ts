import { useState, useCallback } from 'react';

export type Language = 'zh-TW' | 'en' | 'ja';

export const languages: Record<Language, string> = {
  'zh-TW': '繁體中文',
  'en': 'English',
  'ja': '日本語',
};

// Dictionary-based translations
const translations: Record<Language, Record<string, string>> = {
  'zh-TW': {
    // Default language - keys match values
    'welcome': '歡迎',
    'start_tutorial': '開始教學',
    'achievements': '成就',
    'mood_tracker': '心情追蹤',
    // Add more translations as needed
  },
  'en': {
    'welcome': 'Welcome',
    'start_tutorial': 'Start Tutorial',
    'achievements': 'Achievements',
    'mood_tracker': 'Mood Tracker',
  },
  'ja': {
    'welcome': 'ようこそ',
    'start_tutorial': 'チュートリアルを始める',
    'achievements': '実績',
    'mood_tracker': 'ムードトラッカー',
  },
};

// Simple state management for current language
let currentLanguage: Language = 'zh-TW';

export function setLanguage(lang: Language) {
  currentLanguage = lang;
  // Trigger a page reload to update all translations
  window.location.reload();
}

export function getCurrentLanguage(): Language {
  return currentLanguage;
}

export function translate(key: string): string {
  const translation = translations[currentLanguage]?.[key];
  if (!translation) {
    console.warn(`Translation missing for key: ${key} in language: ${currentLanguage}`);
    return key;
  }
  return translation;
}

// React hook for translations
export function useTranslation() {
  const [language, setLang] = useState<Language>(getCurrentLanguage());

  const t = useCallback((key: string) => translate(key), [language]);

  const changeLanguage = useCallback((newLang: Language) => {
    setLanguage(newLang);
    setLang(newLang);
  }, []);

  return {
    t,
    language,
    setLanguage: changeLanguage,
    languages,
  };
}