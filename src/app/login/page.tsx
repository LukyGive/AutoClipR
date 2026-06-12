import { redirect } from "next/navigation";
import { Clapperboard } from "lucide-react";

import { isDemoMode } from "@/lib/env";
import { auth } from "@/lib/auth";
import { signInWithDemo, signInWithTwitch } from "@/features/auth/actions";

export default async function LoginPage() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-mist px-6">
      <div className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-8 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-ink text-white">
            <Clapperboard className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-ink">Connexion AutoClip</h1>
            <p className="text-sm text-zinc-600">Authentification via Twitch</p>
          </div>
        </div>

        <p className="mt-6 text-sm leading-6 text-zinc-700">
          AutoClip utilise Twitch OAuth pour vérifier ton identité, créer des
          clips officiels et écouter les commandes chat autorisées.
        </p>

        <form action={isDemoMode ? signInWithDemo : signInWithTwitch} className="mt-8">
          <button
            type="submit"
            className="flex w-full items-center justify-center rounded bg-twitch px-5 py-3 text-sm font-semibold text-white transition hover:brightness-95"
          >
            {isDemoMode ? "Entrer en démo" : "Continuer avec Twitch"}
          </button>
        </form>
      </div>
    </main>
  );
}
