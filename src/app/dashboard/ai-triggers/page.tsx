import { Brain, Sparkles } from "lucide-react";

import { AppShell } from "@/components/app/app-shell";
import { Card, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { getDashboardPageData } from "@/features/dashboard/dashboard-page-data";
import { RuleSettingsForm } from "@/features/rules/rule-settings-form";
import { getI18n } from "@/i18n/server";

export default async function AiTriggersPage() {
  const { user, analytics } = await getDashboardPageData();
  const { t } = await getI18n();
  const primaryRule = user.clipRules[0];

  return (
    <AppShell user={user}>
      <PageHeader
        eyebrow={t("nav.aiTriggers")}
        title={t("ai.title")}
        description={t("ai.description")}
      />

      <section className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
            <Brain className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="mt-5 flex items-center justify-between gap-3">
            <CardTitle>{t("ai.currentSignal")}</CardTitle>
            <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-violet-200">
              {t("common.comingSoon")}
            </span>
          </div>
          <div className="mt-5 grid gap-3">
            <Metric
              label={t("ai.configuredMatches")}
              value={analytics.matchedSpeechEvents}
            />
            <Metric
              label={t("ai.voiceTriggeredClips")}
              value={analytics.byTrigger.speechToText}
            />
          </div>
          <p className="mt-5 text-sm leading-7 text-muted">
            {t("ai.speechEnginePlanned")}
          </p>
        </Card>

        {primaryRule ? (
          <RuleSettingsForm rule={primaryRule} />
        ) : (
          <Card className="p-6">
            <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
            <CardTitle className="mt-5">{t("ai.noRule")}</CardTitle>
            <p className="mt-3 text-sm text-muted">
              {t("dashboard.noRuleReconnect")}
            </p>
          </Card>
        )}
      </section>
    </AppShell>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-line bg-black/20 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
    </div>
  );
}
