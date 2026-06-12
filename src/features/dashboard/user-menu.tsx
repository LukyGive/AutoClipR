import Image from "next/image";
import { LogOut } from "lucide-react";

import { signOutFromApp } from "@/features/auth/actions";

export function UserMenu({
  name,
  image,
  email
}: {
  name?: string | null;
  image?: string | null;
  email?: string | null;
}) {
  return (
    <div className="flex items-center gap-3">
      {image ? (
        <Image
          src={image}
          alt=""
          width={40}
          height={40}
          className="h-10 w-10 rounded object-cover"
        />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded bg-zinc-200 text-sm font-semibold text-zinc-700">
          {(name ?? email ?? "A").slice(0, 1).toUpperCase()}
        </div>
      )}

      <div className="hidden min-w-0 sm:block">
        <p className="truncate text-sm font-semibold text-ink">{name ?? "Streamer"}</p>
        <p className="truncate text-xs text-zinc-500">{email ?? "Compte Twitch"}</p>
      </div>

      <form action={signOutFromApp}>
        <button
          type="submit"
          className="inline-flex h-10 w-10 items-center justify-center rounded border border-zinc-300 bg-white text-zinc-700 transition hover:bg-zinc-50"
          aria-label="Se déconnecter"
          title="Se déconnecter"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}
