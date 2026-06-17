"use client";

import { useActionState, useState } from "react";
import {
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  RadioTower,
  RotateCw,
  Trash2
} from "lucide-react";
import type { ClipTarget, Plan } from "@prisma/client";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonClassName } from "@/components/ui/button";
import { formatPlanLimit, getPlanLimits } from "@/features/billing/plan-limits";
import {
  addClipTarget,
  deleteClipTarget,
  rotateExternalTriggerToken,
  type TargetActionState
} from "@/features/targets/actions";

const initialAddState: TargetActionState = {};

export function TargetSettings({
  targets,
  baseUrl,
  currentPlan
}: {
  targets: Pick<
    ClipTarget,
    "id" | "twitchLogin" | "twitchName" | "externalTriggerToken" | "createdAt"
  >[];
  baseUrl: string;
  currentPlan: Plan;
}) {
  const [addState, addAction, isAdding] = useActionState(
    addClipTarget,
    initialAddState
  );
  const streamerLimit = getPlanLimits(currentPlan).maxStreamers;

  return (
    <Card className="p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
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
        <span className="w-fit rounded-full border border-line bg-black/20 px-3 py-1 text-xs font-semibold text-muted">
          {targets.length}/{formatPlanLimit(streamerLimit)} streamers
        </span>
      </div>

      <form action={addAction} className="mt-5 flex flex-col gap-3 sm:flex-row">
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
          disabled={isAdding}
          className={buttonClassName({ variant: "secondary" })}
        >
          Add streamer
        </button>
      </form>

      {addState.error ? (
        <p className="mt-3 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-red-200">
          {addState.error}
        </p>
      ) : null}
      {addState.success ? (
        <p className="mt-3 rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-green-200">
          {addState.success}
        </p>
      ) : null}

      <div className="mt-5 grid gap-3">
        {targets.length === 0 ? (
          <EmptyState
            icon={RadioTower}
            title="No streamers configured"
            description="Add a Twitch login to let AutoClipR listen for commands and create clips."
          />
        ) : (
          targets.map((target) => (
            <StreamerCard key={target.id} target={target} baseUrl={baseUrl} />
          ))
        )}
      </div>
    </Card>
  );
}

function StreamerCard({
  target,
  baseUrl
}: {
  target: Pick<
    ClipTarget,
    "id" | "twitchLogin" | "twitchName" | "externalTriggerToken" | "createdAt"
  >;
  baseUrl: string;
}) {
  const [isKeyVisible, setIsKeyVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const triggerUrl = target.externalTriggerToken
    ? `${baseUrl}/api/triggers/external/${target.externalTriggerToken}`
    : null;

  async function copyTriggerUrl() {
    if (!triggerUrl) {
      return;
    }

    await navigator.clipboard.writeText(triggerUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="rounded-lg border border-line bg-black/20 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-semibold text-ink">
            {target.twitchName ?? target.twitchLogin}
          </p>
          <p className="mt-1 text-sm text-muted">@{target.twitchLogin}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-xs font-semibold text-green-300">
            Active
          </span>
          <form
            action={deleteClipTarget}
            onSubmit={(event) => {
              if (!window.confirm("Remove this streamer from AutoClipR?")) {
                event.preventDefault();
              }
            }}
          >
            <input type="hidden" name="targetId" value={target.id} />
            <button
              type="submit"
              className={buttonClassName({
                variant: "danger",
                size: "sm"
              })}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Remove
            </button>
          </form>
        </div>
      </div>

      {triggerUrl ? (
        <div className="mt-4 rounded-lg border border-line bg-surface/70 px-3 py-2.5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted">
              <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
              API trigger key
            </div>
            <div className="flex flex-wrap gap-2">
              {isKeyVisible ? (
                <>
                  <button
                    type="button"
                    onClick={copyTriggerUrl}
                    className={buttonClassName({
                      variant: "secondary",
                      size: "sm"
                    })}
                  >
                    <Copy className="h-4 w-4" aria-hidden="true" />
                    {copied ? "Copied" : "Copy"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsKeyVisible(false)}
                    className={buttonClassName({ variant: "ghost", size: "sm" })}
                  >
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                    Hide
                  </button>
                  <form action={rotateExternalTriggerToken}>
                    <input type="hidden" name="targetId" value={target.id} />
                    <button
                      type="submit"
                      className={buttonClassName({
                        variant: "secondary",
                        size: "sm"
                      })}
                    >
                      <RotateCw className="h-4 w-4" aria-hidden="true" />
                      Regenerate key
                    </button>
                  </form>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsKeyVisible(true)}
                  className={buttonClassName({
                    variant: "secondary",
                    size: "sm"
                  })}
                >
                  <Eye className="h-4 w-4" aria-hidden="true" />
                  Show
                </button>
              )}
            </div>
          </div>

          {isKeyVisible ? (
            <code className="mt-3 block break-all rounded border border-line bg-black/30 p-3 text-xs text-zinc-300">
              {triggerUrl}
            </code>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
