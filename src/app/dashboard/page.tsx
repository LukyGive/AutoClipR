import {
  Activity,
  BarChart3,
  Bot,
  Clapperboard,
  Clock3,
  RadioTower
} from "lucide-react";

import { AppShell } from "@/components/app/app-shell";
import { Card, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatusPill } from "@/components/ui/status-pill";
import { AnalyticsPanel } from "@/features/analytics/analytics-panel";
import { TrialBanner } from "@/features/billing/trial-banner";
import { UsagePanel } from "@/features/billing/usage-panel";
import { CreateClipForm } from "@/features/clips/create-clip-form";
import { RecentClips } from "@/features/clips/recent-clips";
import { getDashboardPageData } from "@/features/dashboard/dashboard-page-data";
import { StatCard } from "@/features/dashboard/stat-card";
import { OnboardingWidget } from "@/features/onboarding/onboarding-widget";
import { RuleSettingsForm } from "@/features/rules/rule-settings-form";
import { TargetSettings } from "@/features/targets/target-settings";
import { getI18n } from "@/i18n/server";

export default async function DashboardPage() {
  const { user, analytics, usage, onboarding, baseUrl, hasClipDownloadScope } =
    await getDashboardPageData();
  const { t } = await getI18n();
  const connectedLabel = user.twitchLogin
    ? `@${user.twitchLogin}`
    : "Twitch pending";
  const primaryRule = user.clipRules[0];
  const totalAnalyzed = analytics.readyClips + analytics.failedClips;
  const successRate =
    totalAnalyzed > 0
      ? Math.round((analytics.readyClips / totalAnalyzed) * 100)
      : 0;
  const estimatedHoursSaved = formatEstimatedHoursSaved(user._count.clips);

  return (
    <AppShell user={user}>
      <PageHeader
        eyebrow={connectedLabel}
        title={t("dashboard.title")}
        description={t("dashboard.description")}
      />

      <TrialBanner
        status={user.subscription?.status}
        currentPeriodEnd={user.subscription?.currentPeriodEnd}
      />

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard
          icon={Clapperboard}
          label={t("dashboard.totalClips")}
          value={String(user._count.clips)}
          detail={t("dashboard.allSavedClipRequests")}
        />
        <StatCard
          icon={Activity}
          label={t("dashboard.clipsThisMonth")}
          value={String(usage.clipsUsed)}
          detail={t("dashboard.currentBillingUsage")}
        />
        <StatCard
          icon={Clock3}
          label={t("dashboard.hoursSaved")}
          value={estimatedHoursSaved}
          detail={t("dashboard.estimatedTwoMinutes")}
        />
        <StatCard
          icon={RadioTower}
          label={t("dashboard.activeStreamers")}
          value={String(user.clipTargets.length)}
          detail={t("dashboard.channelsMonitored")}
        />
        <StatCard
          icon={Bot}
          label={t("dashboard.botStatus")}
          value={
            primaryRule?.enabled ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-success shadow-[0_0_18px_rgba(34,197,94,0.75)] ring-4 ring-success/10" />
                {t("dashboard.online")}
              </span>
            ) : (
              t("common.paused")
            )
          }
          detail={t("dashboard.workerListens")}
        />
        <StatCard
          icon={BarChart3}
          label={t("analytics.successRate")}
          value={`${successRate}%`}
          detail={t("dashboard.currentMonthlyRatio")}
        />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <UsagePanel
          clipsUsed={usage.clipsUsed}
          clipsLimit={usage.clipsLimit}
        />
        <AnalyticsPanel
          readyClips={analytics.readyClips}
          failedClips={analytics.failedClips}
          byTrigger={analytics.byTrigger}
          matchedSpeechEvents={analytics.matchedSpeechEvents}
        />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <TargetSettings
          targets={user.clipTargets}
          baseUrl={baseUrl}
          currentPlan={user.plan}
        />
        <CreateClipForm disabled={!user.twitchUserId} />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <RecentClips
          clips={user.clips}
          hasDownloadScope={hasClipDownloadScope}
        />
        <ActivityFeed user={user} analytics={analytics} t={t} />
      </section>

      <section className="mt-8">
        {primaryRule ? (
          <RuleSettingsForm rule={primaryRule} />
        ) : (
          <Card className="p-6">
            <CardTitle>{t("rules.botRules")}</CardTitle>
            <p className="mt-3 text-sm text-muted">
              {t("dashboard.noRuleReconnect")}
            </p>
          </Card>
        )}
      </section>
      <OnboardingWidget
        hasTwitch={Boolean(user.twitchUserId)}
        streamerCount={user.clipTargets.length}
        totalClips={user._count.clips}
        chatCommandClips={onboarding.chatCommandClips}
        hasDownloadedClip={onboarding.hasDownloadedClip}
      />
    </AppShell>
  );
}

function formatEstimatedHoursSaved(totalClips: number) {
  const hours = (totalClips * 2) / 60;

  if (hours === 0) {
    return "0h";
  }

  if (hours < 10) {
    return `${hours.toFixed(1)}h`;
  }

  return `${Math.round(hours)}h`;
}

function ActivityFeed({
  user,
  analytics,
  t
}: {
  user: Awaited<ReturnType<typeof getDashboardPageData>>["user"];
  analytics: Awaited<ReturnType<typeof getDashboardPageData>>["analytics"];
  t: Awaited<ReturnType<typeof getI18n>>["t"];
}) {
  const items = [
    {
      title: t("dashboard.chatCommandClips"),
      detail: t("dashboard.commandTriggeredClipsThisMonth", {
        count: analytics.byTrigger.chatCommand
      }),
      status: "ACTIVE" as const
    },
    {
      title: t("dashboard.streamerTargets"),
      detail: t("dashboard.connectedChannels", {
        count: user.clipTargets.length
      }),
      status: "ACTIVE" as const
    },
    {
      title: t("dashboard.aiDetection"),
      detail: t("dashboard.matchedAudioEvents", {
        count: analytics.matchedSpeechEvents
      }),
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
          <CardTitle>{t("dashboard.activityFeed")}</CardTitle>
          <p className="mt-1 text-sm text-muted">
            {t("dashboard.activityFeedDescription")}
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
