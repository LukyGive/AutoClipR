"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/features/admin/access";

export async function createAdminPromoCode(formData: FormData) {
  await requireAdminSession();

  const code = String(formData.get("code") ?? "")
    .trim()
    .toUpperCase();
  const durationHours = Number(formData.get("durationHours"));
  const maxUses = Number(formData.get("maxUses"));

  if (
    !/^[A-Z0-9_-]{3,32}$/.test(code) ||
    !Number.isInteger(durationHours) ||
    durationHours <= 0 ||
    !Number.isInteger(maxUses) ||
    maxUses <= 0
  ) {
    redirect("/dashboard/admin?promo=invalid#promo-codes");
  }

  try {
    await prisma.promoCode.create({
      data: {
        code,
        durationHours,
        maxUses
      }
    });
  } catch {
    redirect("/dashboard/admin?promo=exists#promo-codes");
  }

  revalidatePath("/dashboard/admin");
  redirect("/dashboard/admin?promo=created#promo-codes");
}
