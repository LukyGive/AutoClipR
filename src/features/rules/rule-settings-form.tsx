import { Bell, Hash, Keyboard, Shield, Timer, Type } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ClipRule, ClipRulePermission } from "@prisma/client";

import { updateClipRule } from "@/features/rules/actions";

const permissionOptions: Array<{
  value: ClipRulePermission;
  label: string;
}> = [
  { value: "MODERATORS", label: "Modérateurs" },
  { value: "STREAMER_ONLY", label: "Streamer uniquement" },
  { value: "SUBSCRIBERS", label: "Abonnés" },
  { value: "EVERYONE", label: "Tout le monde" }
];

export function RuleSettingsForm({ rule }: { rule: ClipRule }) {
  return (
    <form action={updateClipRule} className="rounded-lg border border-zinc-200 bg-white p-6 shadow-soft">
      <input type="hidden" name="ruleId" value={rule.id} />

      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-ink">Paramètres des clips</h2>
          <p className="mt-1 text-sm text-zinc-600">Nom, durée, commande et déclencheurs.</p>
        </div>
        <label className="inline-flex items-center gap-2 text-sm font-medium text-ink">
          <input
            name="enabled"
            type="checkbox"
            defaultChecked={rule.enabled}
            className="h-4 w-4 rounded border-zinc-300 text-twitch focus:ring-twitch"
          />
          Active
        </label>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field icon={Type} label="Nom global du clip">
          <input
            name="clipTitleTemplate"
            type="text"
            required
            maxLength={80}
            defaultValue={rule.clipTitleTemplate}
            placeholder="Best of live"
            className="w-full rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-twitch focus:ring-2 focus:ring-violet-100"
          />
        </Field>

        <Field icon={Hash} label="Numérotation">
          <div className="flex gap-2">
            <label className="flex h-10 flex-1 items-center gap-2 rounded border border-zinc-300 px-3 text-sm text-ink">
              <input
                name="appendCounter"
                type="checkbox"
                defaultChecked={rule.appendCounter}
                className="h-4 w-4 rounded border-zinc-300 text-twitch focus:ring-twitch"
              />
              Ajouter un chiffre
            </label>
            <input
              name="nextClipNumber"
              type="number"
              min={1}
              max={999999}
              defaultValue={rule.nextClipNumber}
              className="w-24 rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-twitch focus:ring-2 focus:ring-violet-100"
              aria-label="Prochain numéro"
            />
          </div>
        </Field>

        <Field icon={Timer} label="Durée du clip">
          <div className="flex items-center gap-2">
            <input
              name="clipDurationSeconds"
              type="number"
              min={5}
              max={60}
              step={5}
              defaultValue={rule.clipDurationSeconds}
              className="w-full rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-twitch focus:ring-2 focus:ring-violet-100"
            />
            <span className="text-sm text-zinc-500">sec</span>
          </div>
        </Field>

        <Field icon={Keyboard} label="Commande chat">
          <input
            name="command"
            type="text"
            required
            maxLength={32}
            pattern="^![A-Za-z0-9_-]+$"
            defaultValue={rule.command}
            className="w-full rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-twitch focus:ring-2 focus:ring-violet-100"
          />
        </Field>

        <Field icon={Timer} label="Cooldown">
          <div className="flex items-center gap-2">
            <input
              name="cooldownSeconds"
              type="number"
              min={5}
              max={3600}
              step={5}
              defaultValue={rule.cooldownSeconds}
              className="w-full rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-twitch focus:ring-2 focus:ring-violet-100"
            />
            <span className="text-sm text-zinc-500">sec</span>
          </div>
        </Field>

        <Field icon={Shield} label="Permission">
          <select
            name="permission"
            defaultValue={rule.permission}
            className="w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-twitch focus:ring-2 focus:ring-violet-100"
          >
            {permissionOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <Field icon={Bell} label="Notifications">
          <label className="flex h-10 items-center gap-2 rounded border border-zinc-300 px-3 text-sm text-ink">
            <input
              name="notifyOnCreate"
              type="checkbox"
              defaultChecked={rule.notifyOnCreate}
              className="h-4 w-4 rounded border-zinc-300 text-twitch focus:ring-twitch"
            />
            Notifier à la création
          </label>
        </Field>
      </div>

      <label htmlFor="speechInstruction" className="mt-5 block text-sm font-medium text-ink">
        Instruction IA
      </label>
      <textarea
        id="speechInstruction"
        name="speechInstruction"
        rows={3}
        defaultValue={rule.speechInstruction ?? ""}
        placeholder="clip quand je dis INCROYABLE ou GOAL"
        className="mt-2 w-full rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-twitch focus:ring-2 focus:ring-violet-100"
      />
      <p className="mt-2 text-sm text-zinc-500">
        AutoClip extrait les mots-clés de cette instruction et les applique aux transcriptions audio.
      </p>

      <label htmlFor="keywords" className="mt-5 block text-sm font-medium text-ink">
        Mots-clés
      </label>
      <textarea
        id="keywords"
        name="keywords"
        rows={4}
        defaultValue={rule.keywords.join("\n")}
        placeholder="incroyable&#10;goal&#10;wow"
        className="mt-2 w-full rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-twitch focus:ring-2 focus:ring-violet-100"
      />
      <p className="mt-2 text-sm text-zinc-500">
        Ces mots-clés sont utilisés par le chat worker et par l'ingestion speech-to-text.
      </p>

      <button
        type="submit"
        className="mt-5 inline-flex w-full items-center justify-center rounded bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-black"
      >
        Enregistrer la règle
      </button>
    </form>
  );
}

function Field({
  icon: Icon,
  label,
  children
}: {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-ink">
        <Icon className="h-4 w-4 text-twitch" aria-hidden="true" />
        {label}
      </label>
      {children}
    </div>
  );
}
