import { Bell, Hash, Keyboard, Shield, Timer, Type } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ClipRule, ClipRulePermission } from "@prisma/client";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { buttonClassName } from "@/components/ui/button";
import { updateClipRule } from "@/features/rules/actions";
import { getI18n } from "@/i18n/server";

const permissionOptions: ClipRulePermission[] = [
  "MODERATORS",
  "STREAMER_ONLY",
  "SUBSCRIBERS",
  "EVERYONE"
];

const inputClassName =
  "w-full rounded-lg border border-line bg-black/30 px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-zinc-600 focus:border-primary focus:ring-2 focus:ring-primary/25";

const checkboxClassName =
  "h-4 w-4 rounded border-line bg-black text-primary focus:ring-primary focus:ring-offset-mist";

export async function RuleSettingsForm({ rule }: { rule: ClipRule }) {
  const { t } = await getI18n();

  return (
    <form action={updateClipRule}>
      <Card className="p-6">
        <input type="hidden" name="ruleId" value={rule.id} />

        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>{t("rules.botRules")}</CardTitle>
            <CardDescription>
              {t("rules.description")}
            </CardDescription>
          </div>
          <label className="inline-flex items-center gap-2 rounded-full border border-line bg-black/20 px-3 py-2 text-sm font-medium text-ink">
            <input
              name="enabled"
              type="checkbox"
              defaultChecked={rule.enabled}
              className={checkboxClassName}
            />
            {t("rules.active")}
          </label>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field icon={Type} label={t("rules.globalClipName")}>
            <input
              name="clipTitleTemplate"
              type="text"
              required
              maxLength={80}
              defaultValue={rule.clipTitleTemplate}
              placeholder="Best of stream"
              className={inputClassName}
            />
          </Field>

          <Field icon={Hash} label={t("rules.automaticNumbering")}>
            <div className="flex gap-2">
              <label className="flex h-11 flex-1 items-center gap-2 rounded-lg border border-line bg-black/30 px-3 text-sm text-ink">
                <input
                  name="appendCounter"
                  type="checkbox"
                  defaultChecked={rule.appendCounter}
                  className={checkboxClassName}
                />
                {t("rules.addNumber")}
              </label>
              <input
                name="nextClipNumber"
                type="number"
                min={1}
                max={999999}
                defaultValue={rule.nextClipNumber}
                className="w-24 rounded-lg border border-line bg-black/30 px-3 py-2.5 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25"
                aria-label={t("rules.nextNumber")}
              />
            </div>
          </Field>

          <Field icon={Timer} label={t("rules.clipDuration")}>
            <div className="flex items-center gap-2">
              <input
                name="clipDurationSeconds"
                type="number"
                min={5}
                max={60}
                step={5}
                defaultValue={rule.clipDurationSeconds}
                className={inputClassName}
              />
              <span className="text-sm text-muted">sec</span>
            </div>
          </Field>

          <Field icon={Keyboard} label={t("rules.chatCommand")}>
            <input
              name="command"
              type="text"
              required
              maxLength={32}
              pattern="^![A-Za-z0-9_-]+$"
              defaultValue={rule.command}
              className={inputClassName}
            />
          </Field>

          <Field icon={Timer} label={t("rules.cooldown")}>
            <div className="flex items-center gap-2">
              <input
                name="cooldownSeconds"
                type="number"
                min={5}
                max={3600}
                step={5}
                defaultValue={rule.cooldownSeconds}
                className={inputClassName}
              />
              <span className="text-sm text-muted">sec</span>
            </div>
          </Field>

          <Field icon={Shield} label={t("rules.permission")}>
            <select
              name="permission"
              defaultValue={rule.permission}
              className={inputClassName}
            >
              {permissionOptions.map((option) => (
                <option key={option} value={option}>
                  {t(`permissions.${option}`)}
                </option>
              ))}
            </select>
          </Field>

          <Field icon={Bell} label={t("rules.notifications")}>
            <label className="flex h-11 items-center gap-2 rounded-lg border border-line bg-black/30 px-3 text-sm text-ink">
              <input
                name="notifyOnCreate"
                type="checkbox"
                defaultChecked={rule.notifyOnCreate}
                className={checkboxClassName}
              />
              {t("rules.notifyOnCreate")}
            </label>
          </Field>
        </div>

        <label
          htmlFor="speechInstruction"
          className="mt-5 block text-sm font-medium text-ink"
        >
          {t("rules.aiDetectionInstruction")}
          <span className="ml-2 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-semibold text-violet-200">
            {t("common.comingSoon")}
          </span>
        </label>
        <textarea
          id="speechInstruction"
          name="speechInstruction"
          rows={3}
          defaultValue={rule.speechInstruction ?? ""}
          placeholder="clip when I say INCROYABLE or GOAL"
          className={`${inputClassName} mt-2`}
        />
        <p className="mt-2 text-sm leading-6 text-muted">
          {t("rules.instructionHint")}
        </p>

        <label
          htmlFor="keywords"
          className="mt-5 block text-sm font-medium text-ink"
        >
          {t("rules.keywords")}
        </label>
        <textarea
          id="keywords"
          name="keywords"
          rows={4}
          defaultValue={rule.keywords.join("\n")}
          placeholder="incroyable&#10;goal&#10;wow"
          className={`${inputClassName} mt-2`}
        />
        <p className="mt-2 text-sm leading-6 text-muted">
          {t("rules.keywordsHint")}
        </p>

        <button
          type="submit"
          className={buttonClassName({ className: "mt-5 w-full" })}
        >
          {t("rules.save")}
        </button>
      </Card>
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
        <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
        {label}
      </label>
      {children}
    </div>
  );
}
