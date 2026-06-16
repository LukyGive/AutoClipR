import { KeyRound, RadioTower } from "lucide-react";
import type { ClipTarget } from "@prisma/client";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonClassName } from "@/components/ui/button";
import {
  addClipTarget,
  rotateExternalTriggerToken
} from "@/features/targets/actions";

export function TargetSettings({
  targets,
  baseUrl
}: {
  targets: Pick<
    ClipTarget,
    "id" | "twitchLogin" | "twitchName" | "externalTriggerToken" | "createdAt"
  >[];
  baseUrl: string;
}) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
          <RadioTower className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <CardTitle>Streamers</CardTitle>
          <CardDescription>
            The chat worker listens to these Twitch channels.
          </CardDescription>
        </div>
      </div>

      <form
        action={addClipTarget}
        className="mt-5 flex flex-col gap-3 sm:flex-row"
      >
        <input
          name="twitchLogin"
          type="text"
          maxLength={25}
          required
          placeholder="example: jezu_lol"
          className="min-w-0 flex-1 rounded-lg border border-line bg-black/30 px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-zinc-600 focus:border-primary focus:ring-2 focus:ring-primary/25"
        />
        <button
          type="submit"
          className={buttonClassName({ variant: "secondary" })}
        >
          Add streamer
        </button>
      </form>

      <div className="mt-5 grid gap-3">
        {targets.length === 0 ? (
          <EmptyState
            icon={RadioTower}
            title="No streamers configured"
            description="Add a Twitch login to let AutoClipR listen for commands and create clips."
          />
        ) : (
          targets.map((target) => (
            <div
              key={target.id}
              className="rounded-lg border border-line bg-black/20 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-ink">
                    {target.twitchName ?? target.twitchLogin}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    @{target.twitchLogin}
                  </p>
                </div>
                <span className="rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-xs font-semibold text-green-300">
                  Active
                </span>
              </div>

              {target.externalTriggerToken ? (
                <div className="mt-4 rounded-lg border border-line bg-surface/70 p-3">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
                    <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
                    API trigger key
                  </div>
                  <code className="mt-2 block break-all rounded border border-line bg-black/30 p-3 text-xs text-zinc-300">
                    {baseUrl}/api/triggers/external/
                    {target.externalTriggerToken}
                  </code>
                  <form action={rotateExternalTriggerToken} className="mt-3">
                    <input type="hidden" name="targetId" value={target.id} />
                    <button
                      type="submit"
                      className={buttonClassName({
                        variant: "secondary",
                        size: "sm",
                        className: "w-full sm:w-auto"
                      })}
                    >
                      Regenerate key
                    </button>
                  </form>
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
