"use server";

import { ClipTriggerType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { requestClipForUser } from "@/features/clips/create-clip";

export async function createManualClip(formData: FormData) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const title = normalizeTitle(formData.get("title"));
  const broadcasterLogin = normalizeBroadcasterLogin(formData.get("broadcasterLogin"));

  await requestClipForUser({
    userId: session.user.id,
    title,
    broadcasterLogin,
    triggerType: ClipTriggerType.MANUAL,
    triggerValue: "dashboard"
  });

  revalidatePath("/dashboard");
}

function normalizeTitle(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }

  const title = value.trim();
  return title.length > 0 ? title.slice(0, 100) : null;
}

function normalizeBroadcasterLogin(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }

  const login = value.trim().replace(/^@/, "").toLowerCase();
  return login.length > 0 ? login.slice(0, 25) : null;
}
