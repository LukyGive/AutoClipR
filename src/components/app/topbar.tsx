"use client";

import Link from "next/link";
import { Clapperboard, Plus } from "lucide-react";

import { LanguageSwitcher } from "@/components/app/language-switcher";
import { buttonClassName } from "@/components/ui/button";
import { UserMenu } from "@/features/dashboard/user-menu";
import { useTranslation } from "@/i18n/useTranslation";

export function Topbar({
  name,
  email,
  image
}: {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}) {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-mist/75 backdrop-blur-xl">
      <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/dashboard" className="flex items-center gap-3 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/40 bg-primary/15 text-primary">
            <Clapperboard className="h-4 w-4" aria-hidden="true" />
          </div>
          <span className="text-sm font-semibold text-ink">AutoClipR</span>
        </Link>

        <div className="hidden lg:block">
          <p className="text-sm font-medium text-muted">
            {t("appShell.welcomeBack")}
          </p>
          <p className="text-xs text-zinc-500">
            {t("appShell.createMonitorAutomate")}
          </p>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <LanguageSwitcher />
          <a
            href="/dashboard#manual-clip"
            className={buttonClassName({
              size: "sm",
              className: "hidden sm:inline-flex"
            })}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            {t("common.createClip")}
          </a>
          <UserMenu name={name} email={email} image={image} />
        </div>
      </div>
    </header>
  );
}
