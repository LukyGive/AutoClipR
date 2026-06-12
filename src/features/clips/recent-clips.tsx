import { ExternalLink } from "lucide-react";
import type { Clip } from "@prisma/client";

export function RecentClips({
  clips
}: {
  clips: Pick<
    Clip,
    | "id"
    | "title"
    | "url"
    | "editUrl"
    | "embedUrl"
    | "broadcasterLogin"
    | "broadcasterName"
    | "status"
    | "errorCode"
    | "errorMessage"
    | "createdAt"
  >[];
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-soft">
      <h2 className="text-lg font-semibold text-ink">Derniers clips</h2>
      <div className="mt-5 grid gap-3">
        {clips.length === 0 ? (
          <p className="text-sm text-zinc-600">
            Aucun clip enregistré pour le moment.
          </p>
        ) : (
          clips.map((clip) => (
            <article key={clip.id} className="rounded border border-zinc-200 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-ink">
                    {clip.title ?? "Clip sans titre"}
                  </h3>
                  <p className="mt-1 text-xs text-zinc-500">
                    {clip.broadcasterName ?? clip.broadcasterLogin ?? "Chaine inconnue"} -{" "}
                    {clip.createdAt.toLocaleString("fr-FR")}
                  </p>
                </div>
                <StatusBadge status={clip.status} />
              </div>

              {clip.errorMessage ? (
                <p className="mt-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">
                  {clip.errorCode}: {clip.errorMessage}
                </p>
              ) : null}

              {clip.url ? (
                <a
                  href={clip.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-twitch hover:underline"
                >
                  Ouvrir le clip
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              ) : null}

              {clip.editUrl ? (
                <a
                  href={clip.editUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-0 mt-3 inline-flex items-center gap-2 text-sm font-semibold text-zinc-700 hover:underline sm:ml-4"
                >
                  Ouvrir l'éditeur Twitch
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              ) : null}
            </article>
          ))
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Clip["status"] }) {
  const className =
    status === "READY"
      ? "bg-green-50 text-green-700"
      : status === "FAILED"
        ? "bg-red-50 text-red-700"
        : "bg-zinc-100 text-zinc-700";

  return (
    <span className={`rounded px-2 py-1 text-xs font-medium ${className}`}>
      {status}
    </span>
  );
}
