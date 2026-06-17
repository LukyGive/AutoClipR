import { Brain, Sparkles } from "lucide-react";

import { AppShell } from "@/components/app/app-shell";
import { Card, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { getDashboardPageData } from "@/features/dashboard/dashboard-page-data";
import { RuleSettingsForm } from "@/features/rules/rule-settings-form";

export default async function AiTriggersPage() {
  const { user, analytics } = await getDashboardPageData();
  const primaryRule = user.clipRules[0];

  return (
    <AppShell user={user}>
      <PageHeader
        eyebrow="AI Triggers"
        title="AI Voice Detection"
        description="Voice-triggered clipping is coming soon. Keyword settings are saved now so the workflow is ready when speech ingestion launches."
      />

      <section className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
            <Brain className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="mt-5 flex items-center justify-between gap-3">
            <CardTitle>Current signal</CardTitle>
            <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-violet-200">
              Coming Soon
            </span>
          </div>
          <div className="mt-5 grid gap-3">
            <Metric
              label="Configured keyword matches"
              value={analytics.matchedSpeechEvents}
            />
            <Metric
              label="Voice-triggered clips"
              value={analytics.byTrigger.speechToText}
            />
          </div>
          <p className="mt-5 text-sm leading-7 text-muted">
            The speech engine is planned as a modular layer for Whisper,
            Deepgram or another provider. It is not active yet.
          </p>
        </Card>

        {primaryRule ? (
          <RuleSettingsForm rule={primaryRule} />
        ) : (
          <Card className="p-6">
            <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
            <CardTitle className="mt-5">No rule yet</CardTitle>
            <p className="mt-3 text-sm text-muted">
              Reconnect your Twitch account to create the default Bot Rule.
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
