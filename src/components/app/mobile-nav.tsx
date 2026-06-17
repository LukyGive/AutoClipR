"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  Brain,
  CreditCard,
  LayoutDashboard,
  LifeBuoy,
  RadioTower,
  Settings,
  Video
} from "lucide-react";

import { cn } from "@/lib/cn";
import { useTranslation } from "@/i18n/useTranslation";

const navItems = [
  { href: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { href: "/dashboard/clips", labelKey: "nav.clips", icon: Video },
  { href: "/dashboard/rules", labelKey: "nav.rules", icon: Bot },
  { href: "/dashboard/streamers", labelKey: "nav.streamers", icon: RadioTower },
  { href: "/dashboard/ai-triggers", labelKey: "nav.aiTriggers", icon: Brain },
  { href: "/dashboard/billing", labelKey: "nav.billing", icon: CreditCard },
  { href: "/dashboard/support", labelKey: "nav.support", icon: LifeBuoy },
  { href: "/dashboard/settings", labelKey: "nav.settings", icon: Settings }
] as const;

export function MobileNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <nav className="border-b border-line bg-mist/75 px-4 py-3 backdrop-blur-xl lg:hidden">
      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border border-transparent px-3 text-xs font-semibold text-muted transition duration-200",
                isActive
                  ? "border-line bg-surface text-ink"
                  : "hover:bg-surface-hover hover:text-ink"
              )}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              {t(item.labelKey)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
