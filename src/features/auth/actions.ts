"use server";

import { signIn, signOut } from "@/lib/auth";

export async function signInWithTwitch() {
  await signIn("twitch", { redirectTo: "/dashboard" });
}

export async function signInWithDemo() {
  await signIn("demo", { redirectTo: "/dashboard" });
}

export async function signOutFromApp() {
  await signOut({ redirectTo: "/" });
}
