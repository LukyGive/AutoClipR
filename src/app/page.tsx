import Link from "next/link";
import { ArrowRight, Clapperboard, ShieldCheck, Zap } from "lucide-react";

import { auth } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth();

  return (
    <main className="min-h-screen bg-mist">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded bg-ink text-white">
              <Clapperboard className="h-5 w-5" aria-hidden="true" />
            </div>
            <span className="text-lg font-semibold tracking-normal">AutoClip</span>
          </div>
          <Link
            href={session ? "/dashboard" : "/login"}
            className="inline-flex items-center gap-2 rounded bg-ink px-4 py-2 text-sm font-medium text-white transition hover:bg-black"
          >
            {session ? "Dashboard" : "Connexion Twitch"}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </nav>

        <div className="grid flex-1 items-center gap-12 py-16 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-twitch">
              SaaS Twitch automation
            </p>
            <h1 className="max-w-3xl text-5xl font-semibold leading-tight tracking-normal text-ink md:text-6xl">
              AutoClip
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-700">
              Connecte ton compte Twitch, centralise tes clips et prépare une
              automatisation robuste pour les commandes chat, mots-clés et
              speech-to-text.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={session ? "/dashboard" : "/login"}
                className="inline-flex items-center gap-2 rounded bg-twitch px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:brightness-95"
              >
                Démarrer avec Twitch
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <a
                href="#architecture"
                className="inline-flex items-center rounded border border-zinc-300 px-5 py-3 text-sm font-semibold text-ink transition hover:bg-white"
              >
                Voir l'architecture
              </a>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-soft">
            <div className="grid gap-4">
              <Feature
                icon={<ShieldCheck className="h-5 w-5" aria-hidden="true" />}
                title="OAuth Twitch sécurisé"
                description="Sessions persistées en base et scopes Twitch prêts pour clips et chat."
              />
              <Feature
                icon={<Clapperboard className="h-5 w-5" aria-hidden="true" />}
                title="Modèle clip scalable"
                description="Statuts, déclencheurs, erreurs et indexes pensés pour l'exploitation."
              />
              <Feature
                icon={<Zap className="h-5 w-5" aria-hidden="true" />}
                title="Dashboard extensible"
                description="Règles, analytics, billing et automatisations structurés par domaine."
              />
            </div>
          </div>
        </div>
      </section>

      <section id="architecture" className="border-t border-zinc-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 md:grid-cols-3">
          <ArchitectureItem title="App Router" body="Routes serveur, layouts et pages protégées par Auth.js." />
          <ArchitectureItem title="Prisma" body="PostgreSQL comme source de vérité, avec relations et indexes dès le départ." />
          <ArchitectureItem title="Domaines" body="Séparation par features pour garder un monolithe modulaire et durable." />
        </div>
      </section>
    </main>
  );
}

function Feature({
  icon,
  title,
  description
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4 rounded border border-zinc-200 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-violet-50 text-twitch">
        {icon}
      </div>
      <div>
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-zinc-600">{description}</p>
      </div>
    </div>
  );
}

function ArchitectureItem({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-zinc-600">{body}</p>
    </div>
  );
}
