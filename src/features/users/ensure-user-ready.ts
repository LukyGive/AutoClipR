import { prisma } from "@/lib/prisma";

export async function ensureUserReady(userId: string) {
  const twitchAccount = await prisma.account.findFirst({
    where: {
      userId,
      provider: "twitch"
    },
    select: {
      providerAccountId: true
    }
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      twitchUserId: true
    }
  });

  await prisma.$transaction([
    prisma.clipRule.upsert({
      where: { id: `default-${userId}` },
      create: {
        id: `default-${userId}`,
        userId,
        command: "!clip",
        cooldownSeconds: 60
      },
      update: {}
    }),
    ...(twitchAccount && !user?.twitchUserId
      ? [
          prisma.user.update({
            where: { id: userId },
            data: {
              twitchUserId: twitchAccount.providerAccountId
            }
          })
        ]
      : [])
  ]);
}
