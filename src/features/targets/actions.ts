"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { isDemoMode } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { createSecretToken } from "@/lib/tokens";
import { getPlanLimits } from "@/features/billing/plan-limits";
import { getEffectivePlan } from "@/features/billing/access";
import { getTwitchUserByLogin } from "@/features/twitch/helix";
import { getValidTwitchAccessToken } from "@/features/twitch/oauth";
import { getI18n } from "@/i18n/server";

export type TargetActionState = {
  error?: string;
  success?: string;
};

const targetSchema = z.object({
  twitchLogin: z
    .string()
    .trim()
    .min(1)
    .max(25)
    .transform((value) => value.replace(/^@/, "").toLowerCase())
});

export async function addClipTarget(
  _state: TargetActionState,
  formData: FormData
): Promise<TargetActionState> {
  const session = await auth();
  const { t } = await getI18n();

  if (!session?.user) {
    redirect("/login");
  }

  const parsed = targetSchema.safeParse({
    twitchLogin: formData.get("twitchLogin")
  });

  if (!parsed.success) {
    return { error: t("actions.enterValidTwitchLogin") };
  }

  if (isDemoMode) {
    const twitchUserId = `demo-target-${parsed.data.twitchLogin}`;
    const existingTarget = await prisma.clipTarget.findUnique({
      where: {
        userId_twitchUserId: {
          userId: session.user.id,
          twitchUserId
        }
      },
      select: { id: true }
    });
    const limitError = existingTarget
      ? null
      : await getStreamerLimitError(session.user.id);

    if (limitError) {
      return { error: limitError };
    }

    await prisma.clipTarget.upsert({
      where: {
        userId_twitchUserId: {
          userId: session.user.id,
          twitchUserId
        }
      },
      create: {
        userId: session.user.id,
        twitchUserId,
        twitchLogin: parsed.data.twitchLogin,
        twitchName: parsed.data.twitchLogin,
        externalTriggerToken: createSecretToken(),
        isDefault: false
      },
      update: {
        twitchLogin: parsed.data.twitchLogin,
        twitchName: parsed.data.twitchLogin
      }
    });
    revalidateTargetPages();
    return { success: t("actions.streamerAdded") };
  }

  const accessToken = await getValidTwitchAccessToken(session.user.id, [
    "clips:edit"
  ]);
  const twitchUser = await getTwitchUserByLogin({
    accessToken,
    login: parsed.data.twitchLogin
  });
  const existingTarget = await prisma.clipTarget.findUnique({
    where: {
      userId_twitchUserId: {
        userId: session.user.id,
        twitchUserId: twitchUser.id
      }
    },
    select: { id: true }
  });
  const limitError = existingTarget
    ? null
    : await getStreamerLimitError(session.user.id);

  if (limitError) {
    return { error: limitError };
  }

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

  revalidateTargetPages();
  return { success: t("actions.streamerAdded") };
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

  revalidateTargetPages();
}

export async function deleteClipTarget(formData: FormData) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const targetId = z.string().min(1).parse(formData.get("targetId"));

  await prisma.clipTarget.deleteMany({
    where: {
      id: targetId,
      userId: session.user.id
    }
  });

  revalidateTargetPages();
}

async function getStreamerLimitError(userId: string) {
  const { t } = await getI18n();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      plan: true,
      _count: {
        select: {
          clipTargets: true
        }
      }
    }
  });

  if (!user) {
    return "User not found.";
  }

  const effectiveAccess = await getEffectivePlan(userId, user.plan);
  const limit = getPlanLimits(effectiveAccess.plan).maxStreamers;

  if (limit !== null && user._count.clipTargets >= limit) {
    return t("actions.upgradeForMoreStreamers");
  }

  return null;
}

function revalidateTargetPages() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/streamers");
}
