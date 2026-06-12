import { NextResponse } from "next/server";

import { triggerExternalClip } from "@/features/triggers/external-trigger-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  return handleTrigger(params);
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  return handleTrigger(params);
}

async function handleTrigger(params: Promise<{ token: string }>) {
  const { token } = await params;
  const clip = await triggerExternalClip(token);

  if (!clip) {
    return NextResponse.json({ error: "Unknown trigger" }, { status: 404 });
  }

  return NextResponse.json({
    clipId: clip.id,
    status: clip.status,
    url: clip.url,
    errorCode: clip.errorCode,
    errorMessage: clip.errorMessage
  });
}
