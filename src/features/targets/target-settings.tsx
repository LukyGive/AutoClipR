import { RadioTower } from "lucide-react";
import type { ClipTarget } from "@prisma/client";

import { addClipTarget, rotateExternalTriggerToken } from "@/features/targets/actions";

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
    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-soft">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded bg-violet-50 text-twitch">
          <RadioTower className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-ink">Streamer cible</h2>
          <p className="text-sm text-zinc-600">Le worker écoute ces chats Twitch.</p>
        </div>
      </div>

      <form action={addClipTarget} className="mt-5 flex flex-col gap-3 sm:flex-row">
        <input
          name="twitchLogin"
          type="text"
          maxLength={25}
          required
          placeholder="exemple: streamer_demo"
          className="min-w-0 flex-1 rounded border border-zinc-300 bg-white px-3 py-2 text-sm text-ink outline-none transition placeholder:text-zinc-400 focus:border-twitch focus:ring-2 focus:ring-violet-100"
        />
        <button
          type="submit"
          className="rounded bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-black"
        >
          Ajouter
        </button>
      </form>

      <div className="mt-5 grid gap-3">
        {targets.length === 0 ? (
          <p className="text-sm text-zinc-600">
            Aucun streamer cible configuré.
          </p>
        ) : (
          targets.map((target) => (
            <div key={target.id} className="rounded border border-zinc-200 p-4">
              <p className="font-semibold text-ink">
                {target.twitchName ?? target.twitchLogin}
              </p>
              <p className="mt-1 text-sm text-zinc-600">@{target.twitchLogin}</p>
              {target.externalTriggerToken ? (
                <div className="mt-3 rounded bg-zinc-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Bouton externe
                  </p>
                  <code className="mt-2 block break-all text-xs text-ink">
                    {baseUrl}/api/triggers/external/{target.externalTriggerToken}
                  </code>
                  <form action={rotateExternalTriggerToken} className="mt-3">
                    <input type="hidden" name="targetId" value={target.id} />
                    <button
                      type="submit"
                      className="rounded border border-zinc-300 px-3 py-2 text-xs font-semibold text-ink hover:bg-white"
                    >
                      Régénérer le lien
                    </button>
                  </form>
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
