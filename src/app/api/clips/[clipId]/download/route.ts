import { ClipStatus } from "@prisma/client";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTwitchClipDownloadUrls } from "@/features/twitch/helix";
import { getValidTwitchAccessTokenWithAnyScope } from "@/features/twitch/oauth";
import { TWITCH_CLIP_DOWNLOAD_SCOPES } from "@/features/twitch/scopes";
import { TwitchIntegrationError } from "@/features/twitch/errors";

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

  try {
    const accessToken = await getValidTwitchAccessTokenWithAnyScope(
      session.user.id,
      TWITCH_CLIP_DOWNLOAD_SCOPES
    );
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

    return NextResponse.redirect(downloadUrls.landscapeDownloadUrl, 302);
  } catch (error) {
    return mapDownloadError(error);
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
