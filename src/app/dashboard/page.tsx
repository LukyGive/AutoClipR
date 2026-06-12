import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { BarChart3, Clapperboard, Settings2, ShieldCheck } from "lucide-react";

import { auth } from "@/lib/auth";
import { isDemoMode } from "@/lib/env";
import { getDashboardAnalytics } from "@/features/analytics/queries";
import { AnalyticsPanel } from "@/features/analytics/analytics-panel";
import { PlansPanel } from "@/features/billing/plans-panel";
import { UsagePanel } from "@/features/billing/usage-panel";
import { getUserDashboard } from "@/features/users/queries";
import { getUsageSummary } from "@/features/usage/usage-service";
import { CreateClipForm } from "@/features/clips/create-clip-form";
import { RecentClips } from "@/features/clips/recent-clips";
import { StatCard } from "@/features/dashboard/stat-card";
import { UserMenu } from "@/features/dashboard/user-menu";
import { RuleSettingsForm } from "@/features/rules/rule-settings-form";
import { TargetSettings } from "@/features/targets/target-settings";
import { ensureUserReady } from "@/features/users/ensure-user-ready";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  await ensureUserReady(session.user.id);

  const [user, analytics] = await Promise.all([
    getUserDashboard(session.user.id),
    getDashboardAnalytics(session.user.id)
  ]);

  if (!user) {
    redirect("/login");
  }

  const usage = await getUsageSummary(user.id, user.plan);
  const requestHeaders = await headers();
  const baseUrl =
    requestHeaders.get("origin") ??
    `${requestHeaders.get("x-forwarded-proto") ?? "http"}://${requestHeaders.get("host") ?? "localhost:3000"}`;
  const connectedLabel = user.twitchLogin
    ? `@${user.twitchLogin}`
    : "Profil Twitch en attente";
  const primaryRule = user.clipRules[0];

  return (
    <main className="min-h-screen bg-mist">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded bg-ink text-white">
              <Clapperboard className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">AutoClip</p>
              <p className="text-xs text-zinc-500">Dashboard streamer</p>
            </div>
          </div>
          <UserMenu name={user.name} email={user.email} image={user.image} />
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-twitch">
              {connectedLabel}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal text-ink">
              Tableau de bord
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
              Phase 6 active : SaaS avec plans, quotas, analytics et billing Stripe.
            </p>
          </div>
          <div className="rounded border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700">
            {isDemoMode ? <span className="mr-2 font-semibold text-twitch">DEMO</span> : null}
            Plan actuel : <span className="font-semibold text-ink">{user.plan}</span>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <StatCard
            icon={Clapperboard}
            label="Clips enregistrés"
            value={String(user._count.clips)}
            detail="Inclut les demandes réussies et échouées."
          />
          <StatCard
            icon={Settings2}
            label="Règles configurées"
            value={String(user._count.clipRules)}
            detail="La règle !clip est prête pour le worker chat."
          />
          <StatCard
            icon={BarChart3}
            label="Usage clips"
            value={`${usage.clipsUsed}/${usage.clipsLimit}`}
            detail="Quota mensuel du plan courant."
          />
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <UsagePanel
            clipsUsed={usage.clipsUsed}
            clipsLimit={usage.clipsLimit}
            speechEventsUsed={usage.speechEventsUsed}
            speechEventsLimit={usage.speechEventsLimit}
          />
          <AnalyticsPanel
            readyClips={analytics.readyClips}
            failedClips={analytics.failedClips}
            byTrigger={analytics.byTrigger}
            matchedSpeechEvents={analytics.matchedSpeechEvents}
          />
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <TargetSettings targets={user.clipTargets} baseUrl={baseUrl} />
          <CreateClipForm disabled={!user.twitchUserId} />
        </section>

        <section className="mt-8">
          <RecentClips clips={user.clips} />
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-soft">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-success" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-ink">Compte Twitch</h2>
            </div>
            <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
              <ProfileItem label="Nom" value={user.twitchName ?? user.name ?? "Non renseigné"} />
              <ProfileItem label="Login" value={user.twitchLogin ?? "Non renseigné"} />
              <ProfileItem label="Twitch user ID" value={user.twitchUserId ?? "Non renseigné"} />
              <ProfileItem label="Rôle AutoClip" value={user.role} />
            </dl>
          </div>

          {primaryRule ? (
            <RuleSettingsForm rule={primaryRule} />
          ) : (
            <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-soft">
              <h2 className="text-lg font-semibold text-ink">Règles automatiques</h2>
              <p className="mt-4 text-sm text-zinc-600">
                Reconnecte ton compte Twitch pour créer la règle par défaut.
              </p>
            </div>
          )}
        </section>

        <section className="mt-8">
          <PlansPanel
            currentPlan={user.plan}
            hasStripeCustomer={Boolean(user.subscription?.stripeCustomerId)}
          />
        </section>
      </div>
    </main>
  );
}

function ProfileItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-zinc-200 p-4">
      <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </dt>
      <dd className="mt-2 break-words text-sm font-medium text-ink">{value}</dd>
    </div>
  );
}
