"use client";

import Image from "next/image";
import { LogOut } from "lucide-react";

import { signOutFromApp } from "@/features/auth/actions";
import { useTranslation } from "@/i18n/useTranslation";

export function UserMenu({
  name,
  image,
  email
}: {
  name?: string | null;
  image?: string | null;
  email?: string | null;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-3">
      {image ? (
        <Image
          src={image}
          alt=""
          width={40}
          height={40}
          className="h-10 w-10 rounded-lg border border-line object-cover"
        />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-surface text-sm font-semibold text-ink">
          {(name ?? email ?? "A").slice(0, 1).toUpperCase()}
        </div>
      )}

      <div className="hidden min-w-0 sm:block">
        <p className="truncate text-sm font-semibold text-ink">
          {name ?? t("common.streamer")}
        </p>
        <p className="truncate text-xs text-muted">
          {email ?? t("settings.twitchAccountFallback")}
        </p>
      </div>

      <form action={signOutFromApp}>
        <button
          type="submit"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-surface text-muted transition duration-200 hover:bg-surface-hover hover:text-ink"
          aria-label={t("common.signOut")}
          title={t("common.signOut")}
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}
