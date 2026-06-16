import {
  Activity,
  BarChart3,
  Bot,
  Clapperboard,
  RadioTower
} from "lucide-react";

import { AppShell } from "@/components/app/app-shell";
import { Card, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatusPill } from "@/components/ui/status-pill";
import { AnalyticsPanel } from "@/features/analytics/analytics-panel";
import { UsagePanel } from "@/features/billing/usage-panel";
import { CreateClipForm } from "@/features/clips/create-clip-form";
import { RecentClips } from "@/features/clips/recent-clips";
import { getDashboardPageData } from "@/features/dashboard/dashboard-page-data";
import { StatCard } from "@/features/dashboard/stat-card";
import { RuleSettingsForm } from "@/features/rules/rule-settings-form";
import { TargetSettings } from "@/features/targets/target-settings";

export default async function DashboardPage() {
  const { user, analytics, usage, baseUrl, hasClipDownloadScope } =
    await getDashboardPageData();
  const connectedLabel = user.twitchLogin
    ? `@${user.twitchLogin}`
    : "Twitch pending";
  const primaryRule = user.clipRules[0];
  const totalAnalyzed = analytics.readyClips + analytics.failedClips;
  const successRate =
    totalAnalyzed > 0
      ? Math.round((analytics.readyClips / totalAnalyzed) * 100)
      : 0;

  return (
    <AppShell user={user}>
      <PageHeader
        eyebrow={connectedLabel}
        title="Welcome back"
        description="Monitor your Twitch clip automation, active streamers and Bot Rules from one command center."
      />

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Clapperboard}
          label="Total clips"
          value={String(user._count.clips)}
          detail="All saved clip requests."
        />
        <StatCard
          icon={RadioTower}
          label="Active streamers"
          value={String(user.clipTargets.length)}
          detail="Channels monitored by the chat worker."
        />
        <StatCard
          icon={Bot}
          label="Bot status"
          value={primaryRule?.enabled ? "Online" : "Paused"}
          detail="Worker listens when deployed and rule is active."
        />
        <StatCard
          icon={BarChart3}
          label="Success rate"
          value={`${successRate}%`}
          detail="Current monthly ready/failed ratio."
        />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
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

      <section className="mt-8 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <TargetSettings targets={user.clipTargets} baseUrl={baseUrl} />
        <CreateClipForm disabled={!user.twitchUserId} />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <RecentClips
          clips={user.clips}
          hasDownloadScope={hasClipDownloadScope}
        />
        <ActivityFeed user={user} analytics={analytics} />
      </section>

      <section className="mt-8">
        {primaryRule ? (
          <RuleSettingsForm rule={primaryRule} />
        ) : (
          <Card className="p-6">
            <CardTitle>Bot Rules</CardTitle>
            <p className="mt-3 text-sm text-muted">
              Reconnect your Twitch account to create the default Bot Rule.
            </p>
          </Card>
        )}
      </section>
    </AppShell>
  );
}

function ActivityFeed({
  user,
  analytics
}: {
  user: Awaited<ReturnType<typeof getDashboardPageData>>["user"];
  analytics: Awaited<ReturnType<typeof getDashboardPageData>>["analytics"];
}) {
  const items = [
    {
      title: "Chat command clips",
      detail: `${analytics.byTrigger.chatCommand} command-triggered clips this month`,
      status: "ACTIVE" as const
    },
    {
      title: "Streamer targets",
      detail: `${user.clipTargets.length} channel(s) configured`,
      status: "ACTIVE" as const
    },
    {
      title: "AI detection",
      detail: `${analytics.matchedSpeechEvents} matched audio keyword event(s)`,
      status: "PROCESSING" as const
    }
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
          <Activity className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <CardTitle>Activity feed</CardTitle>
          <p className="mt-1 text-sm text-muted">
            Automation signals from this month.
          </p>
        </div>
      </div>
      <div className="mt-5 grid gap-3">
        {items.map((item) => (
          <div
            key={item.title}
            className="rounded-lg border border-line bg-black/20 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-ink">{item.title}</p>
                <p className="mt-1 text-sm text-muted">{item.detail}</p>
              </div>
              <StatusPill status={item.status} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
