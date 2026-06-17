"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  Brain,
  Clapperboard,
  CreditCard,
  LayoutDashboard,
  RadioTower,
  Settings,
  Video
} from "lucide-react";

import { cn } from "@/lib/cn";
import { useTranslation } from "@/i18n/useTranslation";

const navItems = [
  { href: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { href: "/dashboard/clips", labelKey: "nav.clips", icon: Video },
  { href: "/dashboard/rules", labelKey: "nav.botRules", icon: Bot },
  { href: "/dashboard/streamers", labelKey: "nav.streamers", icon: RadioTower },
  { href: "/dashboard/ai-triggers", labelKey: "nav.aiTriggers", icon: Brain },
  { href: "/dashboard/billing", labelKey: "nav.billing", icon: CreditCard },
  { href: "/dashboard/settings", labelKey: "nav.settings", icon: Settings }
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <aside className="hidden min-h-screen w-72 shrink-0 border-r border-line bg-black/35 px-4 py-5 backdrop-blur-xl lg:block">
      <Link
        href="/dashboard"
        className="flex items-center gap-3 rounded-lg px-2 py-2"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/40 bg-primary/15 text-primary shadow-glow">
          <Clapperboard className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">AutoClipR</p>
          <p className="text-xs text-muted">autoclipr.app</p>
        </div>
      </Link>

      <nav className="mt-8 grid gap-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted transition duration-200 hover:bg-surface-hover hover:text-ink",
                isActive ? "bg-surface text-ink ring-1 ring-line" : null
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 rounded-lg border border-line bg-surface/70 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          {t("appShell.botStatus")}
        </p>
        <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-ink">
          <span className="h-2.5 w-2.5 rounded-full bg-success shadow-[0_0_18px_rgba(34,197,94,0.75)] ring-4 ring-success/10" />
          {t("appShell.readyForChatCommands")}
        </div>
        <p className="mt-2 text-xs leading-5 text-muted">
          {t("appShell.railwayWorkerHint")}
        </p>
      </div>
    </aside>
  );
}
