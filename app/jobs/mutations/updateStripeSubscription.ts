import { Ctx } from "blitz"
import db from "db"
import stripe from "app/core/utils/stripe"
import { plans } from "app/core/utils/plans"

interface CreateStripeCheckoutSessionInput {
  jobId: string
  plan: string
}

async function updateStripeSubscription(
  { jobId, plan }: CreateStripeCheckoutSessionInput,
  ctx: Ctx
) {
  ctx.session.$authorize()

  const planId = plans[plan].priceId

  const job = await db.job.findFirst({
    where: {
      id: jobId,
    },
    include: {
      memberships: true,
    },
  })

  const subscription = await stripe.subscriptions.retrieve(job?.stripeSubscriptionId as string)
  await stripe.subscriptions.update(job?.stripeSubscriptionId as string, {
    proration_behavior: "none",
    items: [
      {
        id: subscription.items.data[0]?.id,
        price: planId,
        quantity: job?.memberships.length,
      },
    ],
  })

  await db.job.update({
    where: {
      stripeSubscriptionId: subscription.id,
    },
    data: {
      stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
      stripePriceId: planId,
    },
  })

  return
}

export default updateStripeSubscription
