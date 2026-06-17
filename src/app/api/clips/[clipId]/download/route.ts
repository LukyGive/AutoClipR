import { ClipStatus } from "@prisma/client";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getPublicClipMp4FallbackUrls,
  getTwitchClip,
  getTwitchClipDownloadUrls
} from "@/features/twitch/helix";
import {
  CliprDownloadError,
  getCliprDownloadUrl
} from "@/features/twitch/clipr";
import { getValidTwitchAccessTokenWithAnyScope } from "@/features/twitch/oauth";
import { TWITCH_CLIP_DOWNLOAD_SCOPES } from "@/features/twitch/scopes";
import { TwitchIntegrationError } from "@/features/twitch/errors";
import { withOnboardingDownloadCookie } from "@/features/onboarding/download-tracking";

const DOWNLOAD_UNAVAILABLE = "Download unavailable";
const RECONNECT_TWITCH = "Reconnect Twitch to enable downloads";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ clipId: string }> }
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { clipId } = await params;
  const clip = await prisma.clip.findUnique({
    where: { id: clipId },
    select: {
      id: true,
      userId: true,
      twitchClipId: true,
      broadcasterId: true,
      url: true,
      status: true,
      user: {
        select: {
          twitchUserId: true
        }
      }
    }
  });

  if (!clip || clip.userId !== session.user.id) {
    return NextResponse.json(
      { error: DOWNLOAD_UNAVAILABLE },
      { status: 404 }
    );
  }

  if (clip.status !== ClipStatus.READY) {
    return NextResponse.json(
      { error: DOWNLOAD_UNAVAILABLE },
      { status: 409 }
    );
  }

  if (!clip.twitchClipId || !clip.broadcasterId || !clip.user.twitchUserId) {
    return NextResponse.json(
      { error: DOWNLOAD_UNAVAILABLE },
      { status: 400 }
    );
  }

  let accessToken: string;

  try {
    accessToken = await getValidTwitchAccessTokenWithAnyScope(
      session.user.id,
      TWITCH_CLIP_DOWNLOAD_SCOPES
    );
  } catch (error) {
    return mapDownloadError(error);
  }

  try {
    const downloadUrls = await getTwitchClipDownloadUrls({
      accessToken,
      broadcasterId: clip.broadcasterId,
      editorId: clip.user.twitchUserId,
      clipId: clip.twitchClipId
    });

    if (!downloadUrls.landscapeDownloadUrl) {
      return NextResponse.json(
        { error: DOWNLOAD_UNAVAILABLE },
        { status: 404 }
      );
    }

    console.info("official_download_success", {
      clipId: clip.id,
      twitchClipId: clip.twitchClipId
    });

    return withOnboardingDownloadCookie(
      NextResponse.redirect(downloadUrls.landscapeDownloadUrl, 302),
      session.user.id
    );
  } catch (error) {
    if (isOfficialDownloadForbidden(error)) {
      return attemptPublicFallback({
        accessToken,
        clipRecordId: clip.id,
        userId: session.user.id,
        twitchClipId: clip.twitchClipId,
        twitchUrl: clip.url
      });
    }

    return mapDownloadError(error);
  }
}

async function attemptPublicFallback({
  accessToken,
  clipRecordId,
  userId,
  twitchClipId,
  twitchUrl
}: {
  accessToken: string;
  clipRecordId: string;
  userId: string;
  twitchClipId: string;
  twitchUrl: string | null;
}) {
  console.info("official_download_forbidden_fallback_attempt", {
    clipId: clipRecordId,
    twitchClipId
  });

  try {
    const twitchClip = await getTwitchClip({
      accessToken,
      clipId: twitchClipId
    });
    const fallbackUrls = getPublicClipMp4FallbackUrls(twitchClip?.thumbnailUrl);

    console.info("fallback_download_candidates_built", {
      clipId: clipRecordId,
      twitchClipId,
      thumbnailUrl: twitchClip?.thumbnailUrl ?? null,
      fallbackUrls
    });

    if (fallbackUrls.length === 0) {
      console.warn("fallback_download_failed", {
        clipId: clipRecordId,
        twitchClipId,
        reason: "missing_thumbnail_or_unrecognized_format"
      });

      return attemptCliprFallback({
        clipRecordId,
        userId,
        twitchClipId,
        twitchUrl
      });
    }

    const fallbackUrl = await findFirstAvailableUrl(fallbackUrls);

    if (!fallbackUrl) {
      console.warn("fallback_download_failed", {
        clipId: clipRecordId,
        twitchClipId,
        reason: "fallback_candidates_not_public",
        fallbackUrls
      });

      return attemptCliprFallback({
        clipRecordId,
        userId,
        twitchClipId,
        twitchUrl
      });
    }

    console.info("fallback_download_success", {
      clipId: clipRecordId,
      twitchClipId,
      fallbackUrl
    });

    return withOnboardingDownloadCookie(
      NextResponse.redirect(fallbackUrl, 302),
      userId
    );
  } catch (error) {
    console.warn("fallback_download_failed", {
      clipId: clipRecordId,
      twitchClipId,
      reason: error instanceof Error ? error.message : String(error)
    });

    return attemptCliprFallback({
      clipRecordId,
      userId,
      twitchClipId,
      twitchUrl
    });
  }
}

async function attemptCliprFallback({
  clipRecordId,
  userId,
  twitchClipId,
  twitchUrl
}: {
  clipRecordId: string;
  userId: string;
  twitchClipId: string;
  twitchUrl: string | null;
}) {
  console.info("clipr_download_attempt", {
    clipId: clipRecordId,
    twitchClipId
  });

  try {
    const cliprUrl = await getCliprDownloadUrl(twitchClipId);

    if (!cliprUrl) {
      console.warn("clipr_download_failed", {
        clipId: clipRecordId,
        twitchClipId,
        reason: "missing_download_url"
      });

      return openOnTwitch(twitchClipId, twitchUrl);
    }

    const availableUrl = await findFirstAvailableUrl([cliprUrl]);

    if (!availableUrl) {
      console.warn("clipr_download_failed", {
        clipId: clipRecordId,
        twitchClipId,
        reason: "download_url_not_available"
      });

      return openOnTwitch(twitchClipId, twitchUrl);
    }

    console.info("clipr_download_success", {
      clipId: clipRecordId,
      twitchClipId
    });

    return withOnboardingDownloadCookie(
      NextResponse.redirect(availableUrl, 302),
      userId
    );
  } catch (error) {
    console.warn("clipr_download_failed", {
      clipId: clipRecordId,
      twitchClipId,
      reason: error instanceof Error ? error.message : String(error),
      status: error instanceof CliprDownloadError ? error.status : undefined,
      code: error instanceof CliprDownloadError ? error.code : undefined
    });

    return openOnTwitch(twitchClipId, twitchUrl);
  }
}

async function findFirstAvailableUrl(urls: string[]) {
  for (const url of urls) {
    try {
      const response = await fetch(url, {
        method: "HEAD",
        redirect: "follow"
      });

      console.info("fallback_download_head_result", {
        url,
        status: response.status
      });

      if (response.status === 200) {
        return url;
      }
    } catch (error) {
      console.warn("fallback_download_head_failed", {
        url,
        reason: error instanceof Error ? error.message : String(error)
      });
    }
  }

  return null;
}

function openOnTwitch(twitchClipId: string, twitchUrl: string | null) {
  const fallbackUrl = twitchUrl ?? `https://clips.twitch.tv/${twitchClipId}`;

  console.info("open_twitch_fallback", {
    twitchClipId,
    fallbackUrl
  });

  return NextResponse.redirect(fallbackUrl, 302);
}

function mapDownloadError(error: unknown) {
  if (!(error instanceof TwitchIntegrationError)) {
    return NextResponse.json(
      { error: DOWNLOAD_UNAVAILABLE },
      { status: 500 }
    );
  }

  if (
    error.code === "TWITCH_SCOPE_MISSING" ||
    error.code === "TWITCH_ACCOUNT_NOT_CONNECTED" ||
    error.code === "TWITCH_ACCESS_TOKEN_MISSING" ||
    error.code === "TWITCH_REFRESH_TOKEN_MISSING" ||
    error.code === "TWITCH_REFRESH_FAILED" ||
    error.code === "TWITCH_CLIP_DOWNLOAD_UNAUTHORIZED"
  ) {
    return NextResponse.json(
      { error: RECONNECT_TWITCH },
      { status: 403 }
    );
  }

  if (error.code === "TWITCH_CLIP_DOWNLOAD_RATE_LIMITED") {
    return NextResponse.json(
      { error: "Download rate limited" },
      { status: 429 }
    );
  }

  if (
    error.code === "TWITCH_CLIP_DOWNLOAD_FORBIDDEN" ||
    error.code === "TWITCH_CLIP_DOWNLOAD_NOT_FOUND"
  ) {
    return NextResponse.json(
      { error: DOWNLOAD_UNAVAILABLE },
      { status: error.status ?? 404 }
    );
  }

  return NextResponse.json(
    { error: DOWNLOAD_UNAVAILABLE },
    { status: error.status ?? 500 }
  );
}

function isOfficialDownloadForbidden(error: unknown) {
  return (
    error instanceof TwitchIntegrationError &&
    error.code === "TWITCH_CLIP_DOWNLOAD_FORBIDDEN"
  );
}
