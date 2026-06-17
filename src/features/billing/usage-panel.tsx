import { Card, CardTitle } from "@/components/ui/card";

export function UsagePanel({
  clipsUsed,
  clipsLimit
}: {
  clipsUsed: number;
  clipsLimit: number;
}) {
  return (
    <Card className="p-6">
      <CardTitle>Usage</CardTitle>
      <p className="mt-1 text-sm text-muted">
        Monthly limits for the current plan.
      </p>
      <div className="mt-5 grid gap-5">
        <UsageBar label="Clips" used={clipsUsed} limit={clipsLimit} />
        <ComingSoonUsage />
      </div>
    </Card>
  );
}

function ComingSoonUsage() {
  return (
    <div className="rounded-lg border border-line bg-black/20 p-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-ink">
          AI Voice Detection
        </span>
        <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-violet-200">
          Coming Soon
        </span>
      </div>
      <p className="mt-2 text-sm leading-6 text-muted">
        Voice-triggered clipping is planned and is not available yet.
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
