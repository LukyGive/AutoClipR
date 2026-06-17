"use server";

import { Plan } from "@prisma/client";
import { Prisma } from "@prisma/client";
import type { Route } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { isDemoMode } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { billingPlans } from "@/features/billing/plans";
import { getStripe } from "@/features/billing/stripe";
import { getI18n } from "@/i18n/server";

export type PromoCodeActionState = {
  error?: string;
  success?: string;
};

export async function createCheckoutSession(formData: FormData) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const plan = String(formData.get("plan"));
  const planConfig = billingPlans.find((item) => item.id === plan);

  if (!planConfig || planConfig.id === Plan.FREE || !planConfig.stripePriceId) {
    redirect("/dashboard");
  }

  if (isDemoMode) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { plan: planConfig.id }
    });
    redirect("/dashboard?checkout=demo");
  }

  const origin = (await headers()).get("origin") ?? "http://localhost:3000";
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      subscription: {
        select: {
          stripeCustomerId: true
        }
      }
    }
  });
  const stripe = getStripe();
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: user.subscription?.stripeCustomerId ?? undefined,
    customer_email: user.subscription?.stripeCustomerId ? undefined : user.email ?? undefined,
    client_reference_id: user.id,
    line_items: [
      {
        price: planConfig.stripePriceId,
        quantity: 1
      }
    ],
    metadata: {
      userId: user.id,
      plan: planConfig.id
    },
    subscription_data: {
      trial_period_days: 7,
      metadata: {
        userId: user.id,
        plan: planConfig.id
      }
    },
    success_url: `${origin}/dashboard?checkout=success`,
    cancel_url: `${origin}/dashboard?checkout=cancelled`
  });

  if (!checkoutSession.url) {
    throw new Error("Stripe did not return a Checkout URL.");
  }

  redirect(checkoutSession.url as Route);
}

export async function createBillingPortalSession() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const origin = (await headers()).get("origin") ?? "http://localhost:3000";
  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
    select: { stripeCustomerId: true }
  });

  if (!subscription?.stripeCustomerId) {
    redirect("/dashboard");
  }

  if (isDemoMode) {
    redirect("/dashboard?billing=demo");
  }

  const portalSession = await getStripe().billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${origin}/dashboard`
  });

  redirect(portalSession.url as Route);
}

export async function redeemPromoCode(
  _state: PromoCodeActionState,
  formData: FormData
): Promise<PromoCodeActionState> {
  const session = await auth();
  const { t } = await getI18n();

  if (!session?.user) {
    redirect("/login");
  }

  const code = String(formData.get("code") ?? "")
    .trim()
    .toUpperCase();

  if (!code) {
    return { error: t("promo.invalidCode") };
  }

  const now = new Date();
  const promoCode = await prisma.promoCode.findUnique({
    where: { code },
    select: {
      id: true,
      durationHours: true,
      maxUses: true,
      usedCount: true,
      expiresAt: true
    }
  });

  if (!promoCode) {
    return { error: t("promo.invalidCode") };
  }

  if (promoCode.expiresAt && promoCode.expiresAt <= now) {
    return { error: t("promo.codeExpired") };
  }

  const existingRedemption = await prisma.promoRedemption.findUnique({
    where: {
      userId_promoCodeId: {
        userId: session.user.id,
        promoCodeId: promoCode.id
      }
    },
    select: { id: true }
  });

  if (existingRedemption) {
    return { error: t("promo.codeAlreadyUsed") };
  }

  const accessEndsAt = new Date(
    now.getTime() + promoCode.durationHours * 60 * 60 * 1000
  );

  try {
    await prisma.$transaction(async (tx) => {
      const updated = await tx.promoCode.updateMany({
        where: {
          id: promoCode.id,
          usedCount: {
            lt: promoCode.maxUses
          }
        },
        data: {
          usedCount: {
            increment: 1
          }
        }
      });

      if (updated.count === 0) {
        throw new PromoCodeUsageLimitError();
      }

      await tx.promoRedemption.create({
        data: {
          userId: session.user.id,
          promoCodeId: promoCode.id,
          accessEndsAt
        }
      });
    });
  } catch (error) {
    if (error instanceof PromoCodeUsageLimitError) {
      return { error: t("promo.usageLimitReached") };
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { error: t("promo.codeAlreadyUsed") };
    }

    throw error;
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/billing");

  return {
    success: t("promo.proUnlocked", { hours: promoCode.durationHours })
  };
}

class PromoCodeUsageLimitError extends Error {
  constructor() {
    super("Promo code usage limit reached.");
    this.name = "PromoCodeUsageLimitError";
  }
}
