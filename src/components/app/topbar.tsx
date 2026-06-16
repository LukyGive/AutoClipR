import Link from "next/link";
import { Clapperboard, Plus } from "lucide-react";

import { buttonClassName } from "@/components/ui/button";
import { UserMenu } from "@/features/dashboard/user-menu";

export function Topbar({
  name,
  email,
  image
}: {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}) {
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
          <p className="text-sm font-medium text-muted">Welcome back</p>
          <p className="text-xs text-zinc-500">
            Create, monitor and automate Twitch clips.
          </p>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <a
            href="/dashboard#manual-clip"
            className={buttonClassName({
              size: "sm",
              className: "hidden sm:inline-flex"
            })}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create clip
          </a>
          <UserMenu name={name} email={email} image={image} />
        </div>
      </div>
    </header>
  );
}
