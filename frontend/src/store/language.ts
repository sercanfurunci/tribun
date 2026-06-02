import { create } from 'zustand';
import { translations, type Lang, type TranslationKey } from '../i18n/translations';

interface LanguageStore {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggle: () => void;
}

const stored = localStorage.getItem('tribun_lang') as Lang | null;
const browserLang = navigator.language.toLowerCase().startsWith('tr') ? 'tr' : 'en';
const initialLang: Lang = stored ?? browserLang;

export const useLanguageStore = create<LanguageStore>((set, get) => ({
  lang: initialLang,
  setLang: (lang) => {
    localStorage.setItem('tribun_lang', lang);
    document.documentElement.lang = lang;
    set({ lang });
  },
  toggle: () => {
    const next: Lang = get().lang === 'tr' ? 'en' : 'tr';
    localStorage.setItem('tribun_lang', next);
    document.documentElement.lang = next;
    set({ lang: next });
  },
}));

if (typeof document !== 'undefined') {
  document.documentElement.lang = initialLang;
}

export function useT() {
  const lang = useLanguageStore((s) => s.lang);
  return (key: TranslationKey, vars?: Record<string, string | number>): string => {
    let str: string = translations[lang][key] ?? translations.en[key] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        str = str.replace(`{${k}}`, String(v));
      }
    }
    return str;
  };
}
