import { useState, useEffect, useCallback } from 'react';
import type { Lang } from './translations';

const STORAGE_KEY = 'gioia-lang';

function detectLanguage(): Lang {
  if (typeof window === 'undefined') return 'en';

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'ru' || saved === 'en') return saved;

  const nav = navigator.language ?? '';
  return nav.startsWith('ru') ? 'ru' : 'en';
}

export function useLanguage() {
  const [lang, setLang] = useState<Lang>('en');

  // Detect on mount (client-only)
  useEffect(() => {
    setLang(detectLanguage());
  }, []);

  // Sync <html lang> and localStorage
  useEffect(() => {
    document.documentElement.lang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
  }, [lang]);

  const toggleLang = useCallback(() => {
    setLang((prev) => (prev === 'en' ? 'ru' : 'en'));
  }, []);

  return { lang, toggleLang } as const;
}
