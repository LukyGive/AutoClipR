import { Check } from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";

export function PricingCard({
  name,
  price,
  description,
  features,
  highlighted,
  badge,
  action
}: {
  name: string;
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
  action?: ReactNode;
}) {
  return (
    <Card
      className={cn(
        "flex h-full flex-col p-5",
        highlighted ? "border-primary/50 bg-primary/10 shadow-glow" : null
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-ink">{name}</h3>
          <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
        </div>
        {badge ? <Badge>{badge}</Badge> : null}
      </div>
      <p className="mt-6 text-3xl font-semibold text-ink">{price}</p>
      <ul className="mt-5 grid gap-3 text-sm text-zinc-300">
        {features.map((feature) => (
          <li key={feature} className="flex gap-3">
            <Check
              className="mt-0.5 h-4 w-4 shrink-0 text-success"
              aria-hidden="true"
            />
            {feature.includes("Coming Soon") ? (
              <span className="flex flex-wrap items-center gap-2">
                AI Voice Detection
                <Badge>Coming Soon</Badge>
              </span>
            ) : (
              <span>{feature}</span>
            )}
          </li>
        ))}
      </ul>
      {action ? <div className="mt-auto pt-6">{action}</div> : null}
    </Card>
  );
}
