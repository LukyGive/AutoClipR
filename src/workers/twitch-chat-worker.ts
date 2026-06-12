import { prisma } from "@/lib/prisma";
import { handlePotentialClipCommand } from "@/features/chat/chat-command-service";
import { TwitchIrcClient } from "@/features/chat/twitch-irc-client";
import { getValidTwitchAccessToken } from "@/features/twitch/oauth";

type WorkerTarget = {
  userId: string;
  twitchLogin: string;
  ownerLogin: string;
};

type WorkerRuntime = {
  userId: string;
  ownerLogin: string;
  client?: TwitchIrcClient;
  targets: Map<string, WorkerTarget>;
  reconnectAttempts: number;
  reconnectTimer?: NodeJS.Timeout;
  isConnecting: boolean;
  isShuttingDown: boolean;
};

const REFRESH_INTERVAL_MS = 30_000;
const RECONNECT_BASE_DELAY_MS = 2_000;
const RECONNECT_MAX_DELAY_MS = 60_000;
const runtimes = new Map<string, WorkerRuntime>();

async function main() {
  await refreshTargets();
  setInterval(() => {
    refreshTargets().catch((error) => {
      log(`Refresh failed: ${error instanceof Error ? error.message : String(error)}`);
    });
  }, REFRESH_INTERVAL_MS);
}

async function refreshTargets() {
  const targets = await loadWorkerTargets();

  if (targets.length === 0) {
    stopStaleRuntimes(new Set());
    log("No clip targets found yet. Add a streamer target from the dashboard.");
    return;
  }

  const targetsByUser = groupTargetsByUser(targets);
  stopStaleRuntimes(new Set(targetsByUser.keys()));

  for (const [userId, userTargets] of targetsByUser) {
    try {
      const ownerLogin = userTargets[0]?.ownerLogin;

      if (!ownerLogin) {
        log(`Skipping ${userId}: missing Twitch login for connected account.`);
        continue;
      }

      const channels = [...new Set(userTargets.map((target) => target.twitchLogin))];
      const existingRuntime = runtimes.get(userId);

      if (existingRuntime) {
        existingRuntime.ownerLogin = ownerLogin;
        existingRuntime.targets = new Map(
          userTargets.map((target) => [target.twitchLogin, target])
        );
        existingRuntime.client?.syncChannels(channels);

        if (!existingRuntime.client && !existingRuntime.isConnecting) {
          scheduleReconnect(existingRuntime, 0);
        }

        continue;
      }

      const runtimeTargets = new Map(
        userTargets.map((target) => [target.twitchLogin, target])
      );
      const runtime: WorkerRuntime = {
        userId,
        ownerLogin,
        targets: runtimeTargets,
        reconnectAttempts: 0,
        isConnecting: false,
        isShuttingDown: false
      };

      runtimes.set(userId, runtime);
      await connectRuntime(runtime);
    } catch (error) {
      log(`Skipping ${userId}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

async function connectRuntime(runtime: WorkerRuntime) {
  if (runtime.isConnecting || runtime.isShuttingDown) {
    return;
  }

  runtime.isConnecting = true;

  try {
    const accessToken = await getValidTwitchAccessToken(runtime.userId, [
      "clips:edit",
      "chat:read"
    ]);
    const channels = [...runtime.targets.keys()];
    const client = new TwitchIrcClient({
      accessToken,
      nick: runtime.ownerLogin,
      channels,
      onLog: log,
      onOpen: () => {
        runtime.reconnectAttempts = 0;
        log(`Worker runtime ready for ${runtime.ownerLogin}.`);
      },
      onClose: () => {
        runtime.client = undefined;
        scheduleReconnect(runtime);
      },
      onError: (error) => {
        log(`Runtime error for ${runtime.ownerLogin}: ${error.message}`);
      },
      onMessage: async (message) => {
        const target = runtime.targets.get(message.channel);

        if (!target) {
          return;
        }

        await handlePotentialClipCommand({
          userId: target.userId,
          targetLogin: target.twitchLogin,
          message
        });
      }
    });

    runtime.client = client;
    client.connect();
  } catch (error) {
    log(
      `Connection failed for ${runtime.ownerLogin}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    scheduleReconnect(runtime);
  } finally {
    runtime.isConnecting = false;
  }
}

function scheduleReconnect(runtime: WorkerRuntime, delayOverrideMs?: number) {
  if (runtime.isShuttingDown || runtime.reconnectTimer) {
    return;
  }

  const delayMs =
    delayOverrideMs ??
    Math.min(
      RECONNECT_BASE_DELAY_MS * 2 ** runtime.reconnectAttempts,
      RECONNECT_MAX_DELAY_MS
    );

  runtime.reconnectAttempts += 1;
  log(`Reconnecting ${runtime.ownerLogin} in ${Math.round(delayMs / 1000)}s.`);

  runtime.reconnectTimer = setTimeout(() => {
    runtime.reconnectTimer = undefined;
    connectRuntime(runtime).catch((error) => {
      log(`Reconnect failed: ${error instanceof Error ? error.message : String(error)}`);
      scheduleReconnect(runtime);
    });
  }, delayMs);
}

async function loadWorkerTargets(): Promise<WorkerTarget[]> {
  const targets = await prisma.clipTarget.findMany({
    where: {
      user: {
        twitchLogin: {
          not: null
        },
        clipRules: {
          some: {
            enabled: true
          }
        }
      }
    },
    select: {
      userId: true,
      twitchLogin: true,
      user: {
        select: {
          twitchLogin: true
        }
      }
    }
  });

  return targets
    .filter((target) => target.user.twitchLogin)
    .map((target) => ({
      userId: target.userId,
      twitchLogin: target.twitchLogin.toLowerCase(),
      ownerLogin: target.user.twitchLogin!
    }));
}

function groupTargetsByUser(targets: WorkerTarget[]) {
  const grouped = new Map<string, WorkerTarget[]>();

  for (const target of targets) {
    grouped.set(target.userId, [...(grouped.get(target.userId) ?? []), target]);
  }

  return grouped;
}

function stopStaleRuntimes(activeUserIds: Set<string>) {
  for (const [userId, runtime] of runtimes) {
    if (activeUserIds.has(userId)) {
      continue;
    }

    runtime.isShuttingDown = true;

    if (runtime.reconnectTimer) {
      clearTimeout(runtime.reconnectTimer);
    }

    runtime.client?.close();
    runtimes.delete(userId);
    log(`Stopped worker runtime for ${runtime.ownerLogin}.`);
  }
}

function log(message: string) {
  console.log(`[chat-worker] ${message}`);
}

process.on("SIGINT", async () => {
  for (const runtime of runtimes.values()) {
    runtime.isShuttingDown = true;

    if (runtime.reconnectTimer) {
      clearTimeout(runtime.reconnectTimer);
    }

    runtime.client?.close();
  }

  await prisma.$disconnect();
  process.exit(0);
});

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
