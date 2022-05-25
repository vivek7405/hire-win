import { Ctx } from "blitz"
import db from "db"
import stripe from "app/core/utils/stripe"

interface CreateStripeCheckoutSessionInput {
  companyId: number
  priceId: string
}

async function updateStripeSubscription(
  { companyId, priceId }: CreateStripeCheckoutSessionInput,
  ctx: Ctx
) {
  ctx.session.$authorize()

  const company = await db.company.findFirst({
    where: {
      id: companyId || 0,
    },
  })

  const subscription = await stripe.subscriptions.retrieve(company?.stripeSubscriptionId as string)

  await stripe.subscriptions.update(company?.stripeSubscriptionId as string, {
    proration_behavior: "none",
    items: [
      {
        id: subscription.items.data[0]?.id,
        price: priceId,
        quantity: 1, // user?.memberships.length,
      },
    ],
  })

  await db.company.update({
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
