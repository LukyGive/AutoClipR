import { ClipTriggerType } from "@prisma/client";

import { isDemoMode } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { TwitchIntegrationError } from "@/features/twitch/errors";
import {
  createTwitchClip,
  getTwitchClip,
  getTwitchUserByLogin
} from "@/features/twitch/helix";
import { getValidTwitchAccessToken } from "@/features/twitch/oauth";
import { canCreateClip } from "@/features/usage/usage-service";

const CLIP_CONFIRMATION_ATTEMPTS = 5;
const CLIP_CONFIRMATION_DELAY_MS = 3000;

export async function requestClipForUser({
  userId,
  title,
  broadcasterLogin,
  triggerType,
  triggerValue
}: {
  userId: string;
  title: string | null;
  broadcasterLogin?: string | null;
  triggerType: ClipTriggerType;
  triggerValue?: string;
}) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      plan: true
    }
  });

  if (!user) {
    return createFailedClip({
      userId,
      broadcasterId: "unknown",
      title,
      triggerType,
      triggerValue,
      code: "USER_NOT_FOUND",
      message: "Utilisateur AutoClip introuvable."
    });
  }

  const quota = await canCreateClip(user.id, user.plan);

  if (!quota.allowed) {
    return createFailedClip({
      userId,
      broadcasterId: "unknown",
      broadcasterLogin,
      title,
      triggerType,
      triggerValue,
      code: "PLAN_CLIP_LIMIT_REACHED",
      message: `Limite mensuelle atteinte: ${quota.usage.clipsUsed}/${quota.usage.clipsLimit} clips.`
    });
  }

  if (isDemoMode) {
    const settings = await resolveClipSettings(user.id, title);

    return createDemoClip({
      userId: user.id,
      broadcasterLogin,
      title: settings.title,
      triggerType,
      triggerValue
    });
  }

  try {
    const settings = await resolveClipSettings(user.id, title);
    const accessToken = await getValidTwitchAccessToken(user.id);
    const target = await resolveClipTarget({
      userId: user.id,
      accessToken,
      broadcasterLogin
    });

    const clipRecord = await prisma.clip.create({
      data: {
        userId: user.id,
        clipTargetId: target.clipTargetId,
        broadcasterId: target.id,
        broadcasterLogin: target.login,
        broadcasterName: target.displayName,
        title: settings.title,
        status: "PROCESSING",
        triggerType,
        triggerValue
      }
    });

    try {
      const twitchClip = await createTwitchClip({
        accessToken,
        broadcasterId: target.id,
        title: settings.title,
        duration: settings.durationSeconds
      });
      const confirmedClip = await waitForTwitchClipConfirmation({
        accessToken,
        clipId: twitchClip.id
      });

      return prisma.clip.update({
        where: { id: clipRecord.id },
        data: {
          twitchClipId: twitchClip.id,
          url: confirmedClip.url,
          editUrl: twitchClip.editUrl,
          embedUrl: confirmedClip.embedUrl,
          title: confirmedClip.title || settings.title,
          status: "READY",
          errorCode: null,
          errorMessage: null
        }
      });
    } catch (error) {
      const normalized = normalizeClipError(error);

      return updateFailedClip({
        clipId: clipRecord.id,
        code: normalized.code,
        message: normalized.message
      });
    }
  } catch (error) {
    const normalized = normalizeClipError(error);

    return createFailedClip({
      userId,
      broadcasterId: "unknown",
      broadcasterLogin,
      title,
      triggerType,
      triggerValue,
      code: normalized.code,
      message: normalized.message
    });
  }
}

async function resolveClipSettings(userId: string, explicitTitle: string | null) {
  const rule = await prisma.clipRule.findFirst({
    where: {
      userId,
      enabled: true
    },
    orderBy: {
      createdAt: "asc"
    },
    select: {
      id: true,
      clipTitleTemplate: true,
      appendCounter: true,
      nextClipNumber: true,
      clipDurationSeconds: true
    }
  });

  if (!rule) {
    return {
      title: explicitTitle ?? "AutoClip",
      durationSeconds: 30
    };
  }

  const titleBase = explicitTitle?.trim() || rule.clipTitleTemplate;
  const title = rule.appendCounter ? `${titleBase} #${rule.nextClipNumber}` : titleBase;

  if (rule.appendCounter) {
    await prisma.clipRule.update({
      where: { id: rule.id },
      data: {
        nextClipNumber: {
          increment: 1
        }
      }
    });
  }

  return {
    title,
    durationSeconds: rule.clipDurationSeconds
  };
}

async function waitForTwitchClipConfirmation({
  accessToken,
  clipId
}: {
  accessToken: string;
  clipId: string;
}) {
  for (let attempt = 1; attempt <= CLIP_CONFIRMATION_ATTEMPTS; attempt += 1) {
    const clip = await getTwitchClip({ accessToken, clipId });

    if (clip) {
      return clip;
    }

    if (attempt < CLIP_CONFIRMATION_ATTEMPTS) {
      await sleep(CLIP_CONFIRMATION_DELAY_MS);
    }
  }

  throw new TwitchIntegrationError(
    "Twitch n'a pas confirme la creation du clip apres 15 secondes.",
    "TWITCH_CLIP_CONFIRMATION_TIMEOUT"
  );
}

async function sleep(ms: number) {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function createDemoClip({
  userId,
  broadcasterLogin,
  title,
  triggerType,
  triggerValue
}: {
  userId: string;
  broadcasterLogin?: string | null;
  title: string | null;
  triggerType: ClipTriggerType;
  triggerValue?: string;
}) {
  const login = broadcasterLogin ?? "streamer_demo";
  const target = await prisma.clipTarget.upsert({
    where: {
      userId_twitchUserId: {
        userId,
        twitchUserId: `demo-target-${login}`
      }
    },
    create: {
      userId,
      twitchUserId: `demo-target-${login}`,
      twitchLogin: login,
      twitchName: login
    },
    update: {
      twitchLogin: login,
      twitchName: login
    }
  });
  const clipId = `demo-${Date.now()}`;

  return prisma.clip.create({
    data: {
      userId,
      clipTargetId: target.id,
      twitchClipId: clipId,
      broadcasterId: target.twitchUserId,
      broadcasterLogin: target.twitchLogin,
      broadcasterName: target.twitchName,
      title: title ?? "Demo clip",
      url: `https://clips.twitch.tv/${clipId}`,
      editUrl: `https://clips.twitch.tv/${clipId}/edit`,
      status: "READY",
      triggerType,
      triggerValue: triggerValue ?? "demo:manual"
    }
  });
}

async function resolveClipTarget({
  userId,
  accessToken,
  broadcasterLogin
}: {
  userId: string;
  accessToken: string;
  broadcasterLogin?: string | null;
}) {
  if (!broadcasterLogin) {
    throw new TwitchIntegrationError(
      "Indique le login Twitch de la chaine a clipper.",
      "TWITCH_TARGET_REQUIRED"
    );
  }

  const target = await getTwitchUserByLogin({ accessToken, login: broadcasterLogin });

  const clipTarget = await prisma.clipTarget.upsert({
    where: {
      userId_twitchUserId: {
        userId,
        twitchUserId: target.id
      }
    },
    create: {
      userId,
      twitchUserId: target.id,
      twitchLogin: target.login ?? broadcasterLogin ?? target.id,
      twitchName: target.displayName,
      isDefault: false
    },
    update: {
      twitchLogin: target.login ?? broadcasterLogin ?? target.id,
      twitchName: target.displayName
    }
  });

  return {
    id: target.id,
    login: target.login ?? broadcasterLogin ?? target.id,
    displayName: target.displayName,
    clipTargetId: clipTarget.id
  };
}

async function updateFailedClip({
  clipId,
  code,
  message
}: {
  clipId: string;
  code: string;
  message: string;
}) {
  return prisma.clip.update({
    where: { id: clipId },
    data: {
      status: "FAILED",
      errorCode: code,
      errorMessage: message
    }
  });
}

async function createFailedClip({
  userId,
  broadcasterId,
  broadcasterLogin,
  title,
  triggerType,
  triggerValue,
  code,
  message
}: {
  userId: string;
  broadcasterId: string;
  broadcasterLogin?: string | null;
  title: string | null;
  triggerType: ClipTriggerType;
  triggerValue?: string;
  code: string;
  message: string;
}) {
  return prisma.clip.create({
    data: {
      userId,
      broadcasterId,
      broadcasterLogin,
      title,
      status: "FAILED",
      triggerType,
      triggerValue,
      errorCode: code,
      errorMessage: message
    }
  });
}

function normalizeClipError(error: unknown) {
  if (error instanceof TwitchIntegrationError) {
    return {
      code: error.code,
      message: error.status ? `${error.message} HTTP ${error.status}` : error.message
    };
  }

  if (error instanceof Error) {
    return {
      code: "CLIP_CREATE_FAILED",
      message: error.message
    };
  }

  return {
    code: "CLIP_CREATE_FAILED",
    message: "Erreur inconnue pendant la creation du clip."
  };
}
