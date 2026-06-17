import { Card, CardTitle } from "@/components/ui/card";

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
    <Card className="p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <CardTitle>Analytics</CardTitle>
          <p className="mt-1 text-sm text-muted">Current monthly period.</p>
        </div>
        <div className="rounded-full border border-success/30 bg-success/10 px-3 py-1 text-sm font-semibold text-green-300">
          {successRate}% success
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Metric label="Ready clips" value={readyClips} />
        <Metric label="Failed clips" value={failedClips} />
        <Metric label="Chat commands" value={byTrigger.chatCommand} />
        <Metric label="AI voice soon" value={byTrigger.speechToText} />
        <Metric label="Manual" value={byTrigger.manual} />
        <Metric label="Audio keywords" value={matchedSpeechEvents} />
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
