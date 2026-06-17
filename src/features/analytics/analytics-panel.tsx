"use client";

import { Card, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/i18n/useTranslation";

export function AnalyticsPanel({
  readyClips,
  failedClips,
  byTrigger,
  matchedSpeechEvents
}: {
  readyClips: number;
  failedClips: number;
  byTrigger: {
    manual: number;
    chatCommand: number;
    keyword: number;
    speechToText: number;
  };
  matchedSpeechEvents: number;
}) {
  const { t } = useTranslation();
  const total = readyClips + failedClips;
  const successRate = total > 0 ? Math.round((readyClips / total) * 100) : 0;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <CardTitle>{t("analytics.analytics")}</CardTitle>
          <p className="mt-1 text-sm text-muted">
            {t("analytics.currentMonthlyPeriod")}
          </p>
        </div>
        <div className="rounded-full border border-success/30 bg-success/10 px-3 py-1 text-sm font-semibold text-green-300">
          {t("analytics.success", { rate: successRate })}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Metric label={t("analytics.readyClips")} value={readyClips} />
        <Metric label={t("analytics.failedClips")} value={failedClips} />
        <Metric label={t("analytics.chatCommands")} value={byTrigger.chatCommand} />
        <Metric label={t("analytics.aiVoiceSoon")} value={byTrigger.speechToText} />
        <Metric label={t("analytics.manual")} value={byTrigger.manual} />
        <Metric label={t("analytics.audioKeywords")} value={matchedSpeechEvents} />
      </div>
    </Card>
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
