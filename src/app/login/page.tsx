import { redirect } from "next/navigation";
import { ArrowRight, Clapperboard, ShieldCheck } from "lucide-react";

import { isDemoMode } from "@/lib/env";
import { auth } from "@/lib/auth";
import { signInWithDemo, signInWithTwitch } from "@/features/auth/actions";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default async function LoginPage() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-app-bg px-4 py-10 text-ink sm:px-6">
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="flex flex-col justify-between rounded-lg border border-line bg-black/30 p-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/40 bg-primary/15 text-primary shadow-glow">
                <Clapperboard className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">AutoClipR</p>
                <p className="text-xs text-muted">autoclipr.app</p>
              </div>
            </div>
            <h1 className="mt-10 text-4xl font-semibold leading-tight tracking-normal text-ink md:text-5xl">
              Create clips from the moments your chat already sees.
            </h1>
            <p className="mt-5 text-sm leading-7 text-muted">
              Connect Twitch, configure your streamers and let the chat worker
              turn commands into official Twitch clips.
            </p>
          </div>
          <div className="mt-10 grid gap-3 text-sm text-zinc-300">
            {[
              "Official OAuth",
              "clips:edit scope",
              "Chat command automation"
            ].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <ShieldCheck
                  className="h-4 w-4 text-success"
                  aria-hidden="true"
                />
                {item}
              </div>
            ))}
          </div>
        </div>

        <Card className="p-6 sm:p-8">
          <Badge>{isDemoMode ? "Demo mode" : "Secure sign in"}</Badge>
          <h2 className="mt-5 text-2xl font-semibold tracking-normal text-ink">
            Continue with Twitch
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            AutoClipR uses Twitch OAuth to verify your identity, create official
            clips and authorize the chat worker.
          </p>

          <form
            action={isDemoMode ? signInWithDemo : signInWithTwitch}
            className="mt-8"
          >
            <button
              type="submit"
              className={buttonClassName({ size: "lg", className: "w-full" })}
            >
              {isDemoMode ? "Enter demo" : "Connect with Twitch"}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>

          <div className="mt-6 rounded-lg border border-line bg-black/20 p-4">
            <p className="text-sm font-semibold text-ink">What happens next?</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              You will land in your dashboard where you can add streamers,
              configure Bot Rules and create your first real Twitch clip.
            </p>
          </div>
        </Card>
      </div>
    </main>
  );
}
