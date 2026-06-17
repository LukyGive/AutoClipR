import { en } from "@/i18n/en";
import { fr } from "@/i18n/fr";

export const localeCookieName = "autoclipr_locale";
export const defaultLocale = "en";
export const locales = ["en", "fr"] as const;

export type Locale = (typeof locales)[number];
export type Dictionary = {
  readonly [key: string]: string | Dictionary;
};
export type TranslationVariables = Record<string, string | number>;

export const dictionaries = {
  en,
  fr
} satisfies Record<Locale, Dictionary>;

export function isLocale(value: string | undefined | null): value is Locale {
  return locales.includes(value as Locale);
}

export function translate(
  dictionary: Dictionary,
  key: string,
  variables?: TranslationVariables
) {
  const value = key
    .split(".")
    .reduce<unknown>(
      (current, segment) =>
        current && typeof current === "object"
          ? (current as Record<string, unknown>)[segment]
          : undefined,
      dictionary
    );

  if (typeof value !== "string") {
    return key;
  }

  if (!variables) {
    return value;
  }

  return value.replace(/\{(\w+)\}/g, (match, variable) =>
    Object.prototype.hasOwnProperty.call(variables, variable)
      ? String(variables[variable])
      : match
  );
}
