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

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/clips", label: "Clips", icon: Video },
  { href: "/dashboard/rules", label: "Bot Rules", icon: Bot },
  { href: "/dashboard/streamers", label: "Streamers", icon: RadioTower },
  { href: "/dashboard/ai-triggers", label: "AI Triggers", icon: Brain },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings }
] as const;

export function Sidebar() {
  const pathname = usePathname();

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
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 rounded-lg border border-line bg-surface/70 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Bot status
        </p>
        <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-ink">
          <span className="h-2 w-2 rounded-full bg-success shadow-[0_0_18px_rgba(34,197,94,0.75)]" />
          Ready for chat commands
        </div>
        <p className="mt-2 text-xs leading-5 text-muted">
          Keep the Railway worker online to listen for Twitch chat triggers.
        </p>
      </div>
    </aside>
  );
}
