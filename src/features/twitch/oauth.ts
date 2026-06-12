import type { Account } from "@prisma/client";

import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { TwitchIntegrationError } from "@/features/twitch/errors";

const TOKEN_REFRESH_SKEW_SECONDS = 60;

type TwitchRefreshResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope?: string[];
  token_type: string;
};

export async function getValidTwitchAccessToken(
  userId: string,
  requiredScopes = ["clips:edit"]
) {
  const account = await prisma.account.findFirst({
    where: {
      userId,
      provider: "twitch"
    }
  });

  if (!account) {
    throw new TwitchIntegrationError(
      "Aucun compte Twitch connecte.",
      "TWITCH_ACCOUNT_NOT_CONNECTED"
    );
  }

  ensureScopes(account, requiredScopes);

  if (!account.access_token) {
    throw new TwitchIntegrationError(
      "Le token Twitch est manquant. Reconnecte le compte Twitch.",
      "TWITCH_ACCESS_TOKEN_MISSING"
    );
  }

  if (!shouldRefresh(account.expires_at)) {
    return account.access_token;
  }

  if (!account.refresh_token) {
    throw new TwitchIntegrationError(
      "Le refresh token Twitch est manquant. Reconnecte le compte Twitch.",
      "TWITCH_REFRESH_TOKEN_MISSING"
    );
  }

  return refreshTwitchAccessToken(account);
}

function ensureScopes(account: Account, requiredScopes: string[]) {
  const scopes = new Set(account.scope?.split(" ").filter(Boolean) ?? []);
  const missingScopes = requiredScopes.filter((scope) => !scopes.has(scope));

  if (missingScopes.length > 0) {
    throw new TwitchIntegrationError(
      `Scopes Twitch manquants: ${missingScopes.join(", ")}. Reconnecte le compte Twitch.`,
      "TWITCH_SCOPE_MISSING"
    );
  }
}

function shouldRefresh(expiresAt: number | null) {
  if (!expiresAt) {
    return false;
  }

  const nowInSeconds = Math.floor(Date.now() / 1000);
  return expiresAt - TOKEN_REFRESH_SKEW_SECONDS <= nowInSeconds;
}

async function refreshTwitchAccessToken(account: Account) {
  const response = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: account.refresh_token!,
      client_id: env.AUTH_TWITCH_ID!,
      client_secret: env.AUTH_TWITCH_SECRET!
    })
  });

  if (!response.ok) {
    throw new TwitchIntegrationError(
      "Impossible de rafraichir le token Twitch.",
      "TWITCH_REFRESH_FAILED",
      response.status
    );
  }

  const payload = (await response.json()) as TwitchRefreshResponse;
  const expiresAt = Math.floor(Date.now() / 1000) + payload.expires_in;

  await prisma.account.update({
    where: {
      provider_providerAccountId: {
        provider: account.provider,
        providerAccountId: account.providerAccountId
      }
    },
    data: {
      access_token: payload.access_token,
      refresh_token: payload.refresh_token ?? account.refresh_token,
      expires_at: expiresAt,
      token_type: payload.token_type,
      scope: payload.scope?.join(" ") ?? account.scope
    }
  });

  return payload.access_token;
}
