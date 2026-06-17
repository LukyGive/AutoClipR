import { Card, CardTitle } from "@/components/ui/card";
import { getI18n } from "@/i18n/server";

export async function UsagePanel({
  clipsUsed,
  clipsLimit
}: {
  clipsUsed: number;
  clipsLimit: number;
}) {
  const { t } = await getI18n();

  return (
    <Card className="p-6">
      <CardTitle>{t("usage.title")}</CardTitle>
      <p className="mt-1 text-sm text-muted">
        {t("usage.monthlyLimits")}
      </p>
      <div className="mt-5 grid gap-5">
        <UsageBar label={t("usage.clips")} used={clipsUsed} limit={clipsLimit} />
        <ComingSoonUsage
          title={t("usage.aiVoiceDetection")}
          badge={t("common.comingSoon")}
          description={t("usage.voiceComingSoon")}
        />
      </div>
    </Card>
  );
}

function ComingSoonUsage({
  title,
  badge,
  description
}: {
  title: string;
  badge: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-line bg-black/20 p-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-ink">
          {title}
        </span>
        <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-violet-200">
          {badge}
        </span>
      </div>
      <p className="mt-2 text-sm leading-6 text-muted">
        {description}
      </p>
    </div>
  );
}

function UsageBar({
  label,
  used,
  limit
}: {
  label: string;
  used: number;
  limit: number;
}) {
  const percentage = Math.min(100, Math.round((used / limit) * 100));

  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-ink">{label}</span>
        <span className="text-muted">
          {used}/{limit}
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-2 rounded-full bg-primary"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
