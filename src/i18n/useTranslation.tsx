"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from "react";

import {
  defaultLocale,
  dictionaries,
  isLocale,
  localeCookieName,
  translate,
  type Locale,
  type TranslationVariables
} from "@/i18n";

type TranslationContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, variables?: TranslationVariables) => string;
};

const TranslationContext = createContext<TranslationContextValue | null>(null);

export function TranslationProvider({
  initialLocale,
  children
}: {
  initialLocale: Locale;
  children: ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const value = useMemo<TranslationContextValue>(() => {
    const dictionary = dictionaries[locale];

    return {
      locale,
      setLocale: (nextLocale) => {
        if (!isLocale(nextLocale)) {
          return;
        }

        window.localStorage.setItem(localeCookieName, nextLocale);
        document.cookie = `${localeCookieName}=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
        setLocaleState(nextLocale);
      },
      t: (key, variables) => translate(dictionary, key, variables)
    };
  }, [locale]);

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);

  if (!context) {
    const dictionary = dictionaries[defaultLocale];

    return {
      locale: defaultLocale,
      setLocale: () => undefined,
      t: (key: string, variables?: TranslationVariables) =>
        translate(dictionary, key, variables)
    };
  }

  return context;
}
