import { cn } from "@/lib/cn";

export function StatusPill({ status }: { status: string }) {
  const tone =
    status === "READY" || status === "ONLINE" || status === "ACTIVE"
      ? "border-success/30 bg-success/10 text-green-300"
      : status === "FAILED" || status === "OFFLINE"
        ? "border-danger/30 bg-danger/10 text-red-300"
        : "border-zinc-600 bg-zinc-800/70 text-zinc-300";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        tone
      )}
    >
      {status}
    </span>
  );
}
