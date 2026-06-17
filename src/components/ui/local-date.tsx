"use client";

import { useEffect, useMemo, useState } from "react";

import { formatDate, formatDateTime, formatTrialEnd } from "@/lib/date-format";
import type { Locale } from "@/i18n";
import { useTranslation } from "@/i18n/useTranslation";

type LocalDateProps = {
  date: Date | string;
  variant?: "date" | "dateTime" | "trialEnd";
  fallback?: string;
};

export function LocalDate({
  date,
  variant = "date",
  fallback
}: LocalDateProps) {
  const { locale } = useTranslation();
  const activeLocale = locale as Locale;
  const isoDate = useMemo(() => new Date(date).toISOString(), [date]);
  const [formatted, setFormatted] = useState(fallback ?? "");

  useEffect(() => {
    if (variant === "dateTime") {
      setFormatted(formatDateTime(date, activeLocale));
      return;
    }

    if (variant === "trialEnd") {
      setFormatted(formatTrialEnd(date, activeLocale));
      return;
    }

    setFormatted(formatDate(date, activeLocale));
  }, [activeLocale, date, variant]);

  return (
    <time dateTime={isoDate} suppressHydrationWarning>
      {formatted}
    </time>
  );
}
