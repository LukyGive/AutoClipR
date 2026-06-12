import { Video } from "lucide-react";

import { createManualClip } from "@/features/clips/actions";

export function CreateClipForm({ disabled }: { disabled: boolean }) {
  return (
    <form action={createManualClip} className="rounded-lg border border-zinc-200 bg-white p-6 shadow-soft">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded bg-violet-50 text-twitch">
          <Video className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-ink">Créer un clip</h2>
          <p className="text-sm text-zinc-600">Déclenchement manuel via Twitch Helix.</p>
        </div>
      </div>

      <label htmlFor="broadcaster-login" className="mt-6 block text-sm font-medium text-ink">
        Chaine Twitch a clipper
      </label>
      <input
        id="broadcaster-login"
        name="broadcasterLogin"
        type="text"
        maxLength={25}
        placeholder="exemple: zerator"
        className="mt-2 w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm text-ink outline-none transition placeholder:text-zinc-400 focus:border-twitch focus:ring-2 focus:ring-violet-100"
        disabled={disabled}
        required
      />

      <label htmlFor="clip-title" className="mt-4 block text-sm font-medium text-ink">
        Titre optionnel
      </label>
      <input
        id="clip-title"
        name="title"
        type="text"
        maxLength={100}
        placeholder="Moment fort du live"
        className="mt-2 w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm text-ink outline-none transition placeholder:text-zinc-400 focus:border-twitch focus:ring-2 focus:ring-violet-100"
        disabled={disabled}
      />

      <button
        type="submit"
        disabled={disabled}
        className="mt-4 inline-flex w-full items-center justify-center rounded bg-twitch px-5 py-3 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:bg-zinc-300"
      >
        Demander un clip Twitch
      </button>

      {disabled ? (
        <p className="mt-3 text-sm text-warning">
          Connecte ton profil Twitch avant de créer un clip.
        </p>
      ) : (
        <p className="mt-3 text-sm text-zinc-500">
          Le compte connecte cree un clip sur la chaine cible. Twitch peut refuser si la chaine n'est pas en live, si les clips sont desactives ou si ton compte n'a pas le droit de clipper cette chaine.
        </p>
      )}
    </form>
  );
}
