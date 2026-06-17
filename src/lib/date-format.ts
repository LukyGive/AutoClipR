import type { Locale } from "@/i18n";

type DateInput = Date | string | number | null | undefined;

function toDate(date: DateInput) {
  if (!date) {
    return null;
  }

  const value = date instanceof Date ? date : new Date(date);

  return Number.isNaN(value.getTime()) ? null : value;
}

function getIntlLocale(locale: Locale) {
  return locale === "fr" ? "fr-FR" : "en-GB";
}

export function formatDate(date: DateInput, locale: Locale) {
  const value = toDate(date);

  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat(getIntlLocale(locale), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(value);
}

export function formatDateTime(date: DateInput, locale: Locale) {
  const value = toDate(date);

  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat(getIntlLocale(locale), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(value);
}

export function formatRelativeTime(date: DateInput, locale: Locale) {
  const value = toDate(date);

  if (!value) {
    return "";
  }

  const deltaSeconds = Math.round((value.getTime() - Date.now()) / 1000);
  const units = [
    ["year", 31_536_000],
    ["month", 2_592_000],
    ["week", 604_800],
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
    ["second", 1]
  ] as const;

  const [unit, seconds] =
    units.find(([, unitSeconds]) => Math.abs(deltaSeconds) >= unitSeconds) ??
    units[units.length - 1];

  return new Intl.RelativeTimeFormat(getIntlLocale(locale), {
    numeric: "auto"
  }).format(Math.round(deltaSeconds / seconds), unit);
}

export function formatTrialEnd(date: DateInput, locale: Locale) {
  return formatDate(date, locale);
}
