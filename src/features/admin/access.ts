import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

export const adminEmails = ["lucaspichot999@gmail.com"] as const;

export async function requireAdminSession() {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();

  if (
    !session?.user ||
    !email ||
    !adminEmails.includes(email as (typeof adminEmails)[number])
  ) {
    redirect("/dashboard");
  }

  return session;
}

export function isAdminEmail(email?: string | null) {
  return Boolean(
    email &&
      adminEmails.includes(
        email.toLowerCase() as (typeof adminEmails)[number]
      )
  );
}
