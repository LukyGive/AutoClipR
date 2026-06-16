import { ClipStatus } from "@prisma/client";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getPublicClipMp4FallbackUrl,
  getTwitchClip,
  getTwitchClipDownloadUrls
} from "@/features/twitch/helix";
import { getValidTwitchAccessTokenWithAnyScope } from "@/features/twitch/oauth";
import { TWITCH_CLIP_DOWNLOAD_SCOPES } from "@/features/twitch/scopes";
import { TwitchIntegrationError } from "@/features/twitch/errors";

const DOWNLOAD_UNAVAILABLE = "Download unavailable";
const DOWNLOAD_STILL_PROCESSING =
  "Download unavailable. Twitch may still be processing this clip or the video file is not public yet.";
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

    return NextResponse.redirect(downloadUrls.landscapeDownloadUrl, 302);
  } catch (error) {
    if (isOfficialDownloadForbidden(error)) {
      return attemptPublicFallback({
        accessToken,
        clipRecordId: clip.id,
        twitchClipId: clip.twitchClipId
      });
    }

    return mapDownloadError(error);
  }
}

async function attemptPublicFallback({
  accessToken,
  clipRecordId,
  twitchClipId
}: {
  accessToken: string;
  clipRecordId: string;
  twitchClipId: string;
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
    const fallbackUrl = getPublicClipMp4FallbackUrl(twitchClip?.thumbnailUrl);

    console.info("fallback_download_url_built", {
      clipId: clipRecordId,
      twitchClipId,
      thumbnailUrl: twitchClip?.thumbnailUrl ?? null,
      fallbackUrl
    });

    if (!fallbackUrl) {
      console.warn("fallback_download_failed", {
        clipId: clipRecordId,
        twitchClipId,
        reason: "missing_thumbnail_or_unrecognized_format"
      });

      return NextResponse.json(
        { error: DOWNLOAD_STILL_PROCESSING },
        { status: 404 }
      );
    }

    console.info("fallback_download_success", {
      clipId: clipRecordId,
      twitchClipId
    });

    return NextResponse.redirect(fallbackUrl, 302);
  } catch (error) {
    console.warn("fallback_download_failed", {
      clipId: clipRecordId,
      twitchClipId,
      reason: error instanceof Error ? error.message : String(error)
    });

    return NextResponse.json(
      { error: DOWNLOAD_STILL_PROCESSING },
      { status: 404 }
    );
  }
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
