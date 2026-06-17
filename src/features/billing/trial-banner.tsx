import type { SubscriptionStatus } from "@prisma/client";
import { Sparkles } from "lucide-react";

export function TrialBanner({
  status,
  currentPeriodEnd
}: {
  status?: SubscriptionStatus | null;
  currentPeriodEnd?: Date | null;
}) {
  if (status !== "TRIALING" || !currentPeriodEnd) {
    return null;
  }

  const now = new Date();
  const daysRemaining = Math.max(
    0,
    Math.ceil((currentPeriodEnd.getTime() - now.getTime()) / 86_400_000)
  );

  return (
    <section className="mt-8 rounded-lg border border-primary/40 bg-primary/10 p-5 shadow-glow backdrop-blur">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary/40 bg-primary/15 text-primary">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">
              Pro trial ends in {daysRemaining}{" "}
              {daysRemaining === 1 ? "day" : "days"}
            </p>
            <p className="mt-1 text-sm text-muted">
              Trial ends on {currentPeriodEnd.toLocaleDateString("fr-FR")}.
            </p>
          </div>
        </div>
        <span className="w-fit rounded-full border border-primary/40 bg-black/20 px-3 py-1 text-xs font-semibold text-violet-200">
          7-day trial
        </span>
      </div>
    </section>
  );
}
