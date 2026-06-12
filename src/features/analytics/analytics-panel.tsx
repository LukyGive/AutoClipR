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
  const total = readyClips + failedClips;
  const successRate = total > 0 ? Math.round((readyClips / total) * 100) : 0;

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-soft">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-ink">Analytics</h2>
          <p className="mt-1 text-sm text-zinc-600">Période mensuelle courante.</p>
        </div>
        <div className="rounded bg-green-50 px-3 py-2 text-sm font-semibold text-green-700">
          {successRate}% READY
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Metric label="Clips prêts" value={readyClips} />
        <Metric label="Clips échoués" value={failedClips} />
        <Metric label="Commande chat" value={byTrigger.chatCommand} />
        <Metric label="Speech-to-text" value={byTrigger.speechToText} />
        <Metric label="Manuels" value={byTrigger.manual} />
        <Metric label="Mots-clés audio" value={matchedSpeechEvents} />
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border border-zinc-200 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
    </div>
  );
}
