"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { isDemoMode } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { createSecretToken } from "@/lib/tokens";
import { getTwitchUserByLogin } from "@/features/twitch/helix";
import { getValidTwitchAccessToken } from "@/features/twitch/oauth";

const targetSchema = z.object({
  twitchLogin: z
    .string()
    .trim()
    .min(1)
    .max(25)
    .transform((value) => value.replace(/^@/, "").toLowerCase())
});

export async function addClipTarget(formData: FormData) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const parsed = targetSchema.parse({
    twitchLogin: formData.get("twitchLogin")
  });

  if (isDemoMode) {
    await prisma.clipTarget.upsert({
      where: {
        userId_twitchUserId: {
          userId: session.user.id,
          twitchUserId: `demo-target-${parsed.twitchLogin}`
        }
      },
      create: {
        userId: session.user.id,
        twitchUserId: `demo-target-${parsed.twitchLogin}`,
        twitchLogin: parsed.twitchLogin,
        twitchName: parsed.twitchLogin,
        externalTriggerToken: createSecretToken(),
        isDefault: false
      },
      update: {
        twitchLogin: parsed.twitchLogin,
        twitchName: parsed.twitchLogin
      }
    });
    revalidatePath("/dashboard");
    return;
  }

  const accessToken = await getValidTwitchAccessToken(session.user.id, ["clips:edit"]);
  const twitchUser = await getTwitchUserByLogin({
    accessToken,
    login: parsed.twitchLogin
  });

  await prisma.clipTarget.upsert({
    where: {
      userId_twitchUserId: {
        userId: session.user.id,
        twitchUserId: twitchUser.id
      }
    },
    create: {
      userId: session.user.id,
      twitchUserId: twitchUser.id,
      twitchLogin: twitchUser.login,
      twitchName: twitchUser.displayName,
      externalTriggerToken: createSecretToken(),
      isDefault: false
    },
    update: {
      twitchLogin: twitchUser.login,
      twitchName: twitchUser.displayName
    }
  });

  revalidatePath("/dashboard");
}

export async function rotateExternalTriggerToken(formData: FormData) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const targetId = z.string().min(1).parse(formData.get("targetId"));

  await prisma.clipTarget.updateMany({
    where: {
      id: targetId,
      userId: session.user.id
    },
    data: {
      externalTriggerToken: createSecretToken()
    }
  });

  revalidatePath("/dashboard");
}
