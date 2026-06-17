import { cookies } from "next/headers";

import {
  defaultLocale,
  dictionaries,
  isLocale,
  localeCookieName,
  translate
} from "@/i18n";

export async function getLocale() {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(localeCookieName)?.value;

  return isLocale(cookieLocale) ? cookieLocale : defaultLocale;
}

export async function getI18n() {
  const locale = await getLocale();
  const dictionary = dictionaries[locale];

  return {
    dictionary,
    locale,
    t: (key: string, variables?: Record<string, string | number>) =>
      translate(dictionary, key, variables)
  };
}
