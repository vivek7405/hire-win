import { Ctx } from "blitz"
import db from "db"
import stripe from "src/core/utils/stripe"

interface CreateStripeCheckoutSessionInput {
  userId: string
  priceId: string
}

async function updateStripeSubscription(
  { userId, priceId }: CreateStripeCheckoutSessionInput,
  ctx: Ctx
) {
  ctx.session.$authorize()

  const user = await db.user.findFirst({
    where: {
      id: userId || "0",
    },
  })

  const subscription = await stripe.subscriptions.retrieve(user?.stripeSubscriptionId as string)

  await stripe.subscriptions.update(user?.stripeSubscriptionId as string, {
    proration_behavior: "none",
    items: [
      {
        id: subscription.items.data[0]?.id,
        price: priceId,
        quantity: 1, // user?.memberships.length,
      },
    ],
  })

  await db.user.update({
    where: {
      stripeSubscriptionId: subscription.id,
    },
    data: {
      stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
      stripePriceId: priceId,
    },
  })

  return
}

export default updateStripeSubscription
