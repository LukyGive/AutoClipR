import { Video } from "lucide-react";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { buttonClassName } from "@/components/ui/button";
import { createManualClip } from "@/features/clips/actions";

const inputClassName =
  "mt-2 w-full rounded-lg border border-line bg-black/30 px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-zinc-600 focus:border-primary focus:ring-2 focus:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-50";

export function CreateClipForm({ disabled }: { disabled: boolean }) {
  return (
    <form id="manual-clip" action={createManualClip}>
      <Card className="p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
            <Video className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <CardTitle>Create clip</CardTitle>
            <CardDescription>
              Trigger a manual Twitch Helix clip.
            </CardDescription>
          </div>
        </div>

        <label
          htmlFor="broadcaster-login"
          className="mt-6 block text-sm font-medium text-ink"
        >
          Twitch channel to clip
        </label>
        <input
          id="broadcaster-login"
          name="broadcasterLogin"
          type="text"
          maxLength={25}
          placeholder="example: jezu_lol"
          className={inputClassName}
          disabled={disabled}
          required
        />

        <label
          htmlFor="clip-title"
          className="mt-4 block text-sm font-medium text-ink"
        >
          Optional title
        </label>
        <input
          id="clip-title"
          name="title"
          type="text"
          maxLength={100}
          placeholder="Best moment from stream"
          className={inputClassName}
          disabled={disabled}
        />

        <button
          type="submit"
          disabled={disabled}
          className={buttonClassName({ className: "mt-5 w-full" })}
        >
          Create Twitch clip
        </button>

        {disabled ? (
          <p className="mt-3 text-sm text-warning">
            Connect your Twitch profile before creating clips.
          </p>
        ) : (
          <p className="mt-3 text-sm leading-6 text-muted">
            Twitch can refuse the request if the channel is offline, clips are
            disabled or your account cannot clip this channel.
          </p>
        )}
      </Card>
    </form>
  );
}
