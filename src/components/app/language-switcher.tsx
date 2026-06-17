"use client";

import { useRouter } from "next/navigation";

import { cn } from "@/lib/cn";
import { locales, type Locale } from "@/i18n";
import { useTranslation } from "@/i18n/useTranslation";

export function LanguageSwitcher() {
  const router = useRouter();
  const { locale, setLocale } = useTranslation();

  function selectLocale(nextLocale: Locale) {
    setLocale(nextLocale);
    router.refresh();
  }

  return (
    <div className="inline-flex rounded-lg border border-line bg-black/20 p-1">
      {locales.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => selectLocale(item)}
          className={cn(
            "h-8 rounded-md px-2.5 text-xs font-semibold uppercase text-muted transition duration-200 hover:text-ink",
            locale === item ? "bg-surface text-ink shadow-sm" : null
          )}
          aria-pressed={locale === item}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
