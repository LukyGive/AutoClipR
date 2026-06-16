"use server";

import { Plan } from "@prisma/client";
import type { Route } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { isDemoMode } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { billingPlans } from "@/features/billing/plans";
import { getStripe } from "@/features/billing/stripe";

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
