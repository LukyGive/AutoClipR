import { Card, CardTitle } from "@/components/ui/card";

export function UsagePanel({
  clipsUsed,
  clipsLimit,
  speechEventsUsed,
  speechEventsLimit
}: {
  clipsUsed: number;
  clipsLimit: number;
  speechEventsUsed: number;
  speechEventsLimit: number;
}) {
  return (
    <Card className="p-6">
      <CardTitle>Usage</CardTitle>
      <p className="mt-1 text-sm text-muted">
        Monthly limits for the current plan.
      </p>
      <div className="mt-5 grid gap-5">
        <UsageBar label="Clips" used={clipsUsed} limit={clipsLimit} />
        <UsageBar
          label="AI events"
          used={speechEventsUsed}
          limit={speechEventsLimit}
        />
      </div>
    </Card>
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
