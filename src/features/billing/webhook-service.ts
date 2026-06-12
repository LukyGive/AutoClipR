import { Plan, type SubscriptionStatus } from "@prisma/client";
import type Stripe from "stripe";

import { prisma } from "@/lib/prisma";
import { getPlanByStripePriceId } from "@/features/billing/plans";
import { getStripe } from "@/features/billing/stripe";

export async function processStripeEvent(event: Stripe.Event) {
  const existingEvent = await prisma.stripeWebhookEvent.findUnique({
    where: { id: event.id }
  });

  if (existingEvent) {
    return;
  }

  if (event.type === "checkout.session.completed") {
    await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
  }

  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
  }

  await prisma.stripeWebhookEvent.create({
    data: {
      id: event.id,
      type: event.type
    }
  });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (!session.subscription || !session.customer) {
    return;
  }

  const userId = session.metadata?.userId ?? session.client_reference_id;

  if (!userId) {
    return;
  }

  const subscription = await getStripe().subscriptions.retrieve(
    String(session.subscription)
  );

  await syncSubscription(userId, String(session.customer), subscription);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.userId;
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  if (!userId) {
    return;
  }

  await syncSubscription(userId, customerId, subscription);
}

async function syncSubscription(
  userId: string,
  stripeCustomerId: string,
  subscription: Stripe.Subscription
) {
  const priceId = subscription.items.data[0]?.price.id;
  const plan = subscription.status === "active" || subscription.status === "trialing"
    ? getPlanByStripePriceId(priceId)
    : Plan.FREE;
  const status = mapStripeStatus(subscription.status);
  const currentPeriodEnd = getCurrentPeriodEnd(subscription);

  await prisma.$transaction([
    prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        stripeCustomerId,
        stripeSubscriptionId: subscription.id,
        stripePriceId: priceId,
        status,
        currentPeriodEnd
      },
      update: {
        stripeCustomerId,
        stripeSubscriptionId: subscription.id,
        stripePriceId: priceId,
        status,
        currentPeriodEnd
      }
    }),
    prisma.user.update({
      where: { id: userId },
      data: { plan }
    })
  ]);
}

function mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  if (status === "trialing") {
    return "TRIALING";
  }

  if (status === "active") {
    return "ACTIVE";
  }

  if (status === "past_due") {
    return "PAST_DUE";
  }

  if (status === "canceled") {
    return "CANCELED";
  }

  if (status === "unpaid") {
    return "UNPAID";
  }

  return "INCOMPLETE";
}

function getCurrentPeriodEnd(subscription: Stripe.Subscription) {
  const periodEnd = (subscription as Stripe.Subscription & {
    current_period_end?: number | null;
  }).current_period_end;

  return periodEnd ? new Date(periodEnd * 1000) : null;
}
