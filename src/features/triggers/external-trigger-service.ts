import { ClipTriggerType } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { requestClipForUser } from "@/features/clips/create-clip";

export async function triggerExternalClip(token: string) {
  const target = await prisma.clipTarget.findUnique({
    where: {
      externalTriggerToken: token
    },
    select: {
      userId: true,
      twitchLogin: true,
      twitchName: true,
      user: {
        select: {
          clipRules: {
            where: {
              enabled: true
            },
            orderBy: {
              createdAt: "asc"
            },
            take: 1
          }
        }
      }
    }
  });

  if (!target) {
    return null;
  }

  const rule = target.user.clipRules[0];
  const clip = await requestClipForUser({
    userId: target.userId,
    broadcasterLogin: target.twitchLogin,
    title: null,
    triggerType: ClipTriggerType.MANUAL,
    triggerValue: `external:${target.twitchLogin}:${rule?.command ?? "button"}`
  });

  return clip;
}
