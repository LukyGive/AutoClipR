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
    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-soft">
      <h2 className="text-lg font-semibold text-ink">Utilisation</h2>
      <div className="mt-5 grid gap-5">
        <UsageBar label="Clips" used={clipsUsed} limit={clipsLimit} />
        <UsageBar label="Événements IA" used={speechEventsUsed} limit={speechEventsLimit} />
      </div>
    </div>
  );
}

function UsageBar({ label, used, limit }: { label: string; used: number; limit: number }) {
  const percentage = Math.min(100, Math.round((used / limit) * 100));

  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-ink">{label}</span>
        <span className="text-zinc-600">
          {used}/{limit}
        </span>
      </div>
      <div className="mt-2 h-2 rounded bg-zinc-100">
        <div className="h-2 rounded bg-twitch" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
