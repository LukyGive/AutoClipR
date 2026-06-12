"use server";

import { ClipRulePermission } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ruleSchema = z.object({
  ruleId: z.string().min(1),
  enabled: z.boolean(),
  command: z
    .string()
    .trim()
    .min(1)
    .max(32)
    .regex(/^![a-z0-9_-]+$/i),
  clipTitleTemplate: z.string().trim().min(1).max(80),
  appendCounter: z.boolean(),
  nextClipNumber: z.coerce.number().int().min(1).max(999999),
  clipDurationSeconds: z.coerce.number().int().min(5).max(60),
  cooldownSeconds: z.coerce.number().int().min(5).max(3600),
  permission: z.nativeEnum(ClipRulePermission),
  keywords: z
    .string()
    .max(1000)
    .transform((value) =>
      value
        .split(/\r?\n|,/)
        .map((keyword) => keyword.trim().toLowerCase())
        .filter(Boolean)
        .slice(0, 50)
    ),
  speechInstruction: z.string().trim().max(1000).optional(),
  notifyOnCreate: z.boolean()
});

export async function updateClipRule(formData: FormData) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const parsed = ruleSchema.parse({
    ruleId: formData.get("ruleId"),
    enabled: formData.get("enabled") === "on",
    command: formData.get("command"),
    clipTitleTemplate: formData.get("clipTitleTemplate"),
    appendCounter: formData.get("appendCounter") === "on",
    nextClipNumber: formData.get("nextClipNumber"),
    clipDurationSeconds: formData.get("clipDurationSeconds"),
    cooldownSeconds: formData.get("cooldownSeconds"),
    permission: formData.get("permission"),
    keywords: formData.get("keywords") ?? "",
    speechInstruction: String(formData.get("speechInstruction") ?? ""),
    notifyOnCreate: formData.get("notifyOnCreate") === "on"
  });
  const instructionKeywords = parseSpeechInstruction(parsed.speechInstruction ?? "");
  const keywords = mergeKeywords(parsed.keywords, instructionKeywords);

  await prisma.clipRule.updateMany({
    where: {
      id: parsed.ruleId,
      userId: session.user.id
    },
    data: {
      enabled: parsed.enabled,
      command: parsed.command.toLowerCase(),
      clipTitleTemplate: parsed.clipTitleTemplate,
      appendCounter: parsed.appendCounter,
      nextClipNumber: parsed.nextClipNumber,
      clipDurationSeconds: parsed.clipDurationSeconds,
      cooldownSeconds: parsed.cooldownSeconds,
      permission: parsed.permission,
      keywords,
      speechInstruction: parsed.speechInstruction || null,
      notifyOnCreate: parsed.notifyOnCreate
    }
  });

  revalidatePath("/dashboard");
}

function parseSpeechInstruction(instruction: string) {
  const normalized = instruction
    .toLowerCase()
    .replace(/clip quand je dis/g, "")
    .replace(/clip lorsque je dis/g, "")
    .replace(/clip si je dis/g, "")
    .replace(/:/g, " ");

  return normalized
    .split(/\bou\b|,|\n/)
    .map((keyword) => keyword.trim())
    .filter(Boolean)
    .slice(0, 20);
}

function mergeKeywords(existing: string[], extracted: string[]) {
  return [...new Set([...existing, ...extracted])]
    .map((keyword) => keyword.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 50);
}
