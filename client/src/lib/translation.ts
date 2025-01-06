import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type Language = 'zh-TW' | 'en' | 'ja';

export const languages: Record<Language, string> = {
  'zh-TW': '繁體中文',
  'en': 'English',
  'ja': '日本語',
};

interface TranslationContextType {
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
  translate: (text: string) => Promise<string>;
}

const TranslationContext = createContext<TranslationContextType | null>(null);

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}

interface TranslationProviderProps {
  children: ReactNode;
}

async function translateText(text: string, targetLang: Language): Promise<string> {
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        targetLanguage: targetLang,
      }),
    });

    if (!response.ok) {
      throw new Error('Translation failed');
    }

    const data = await response.json();
    return data.translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    return text;
  }
}

export function TranslationProvider({ children }: TranslationProviderProps) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('zh-TW');

  const translate = useCallback(async (text: string) => {
    if (currentLanguage === 'zh-TW') {
      return text;
    }
    return translateText(text, currentLanguage);
  }, [currentLanguage]);

  return (
    <TranslationContext.Provider 
      value={{
        currentLanguage,
        setLanguage: setCurrentLanguage,
        translate,
      }}
    >
      {children}
    </TranslationContext.Provider>
  );
}