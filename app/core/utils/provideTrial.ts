import db from "db"
import { PlanName } from "types"
import { plans } from "./plans"
import stripe from "./stripe"

async function provideTrail(userId, companyId) {
  const companyUser = await db.companyUser.findFirst({
    where: { userId, companyId },
    include: { company: true, user: true },
  })

  if (!companyUser) return

  const plan = plans?.find((plan) => plan.name === PlanName.PRO)

  if (!companyUser?.company.stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: companyUser?.user.email,
    })

    const subscription = await stripe.subscriptions.create({
      customer: companyUser?.company?.stripeCustomerId
        ? companyUser?.company?.stripeCustomerId
        : customer.id,
      items: [
        {
          price: plan?.priceId as string,
          quantity: 1,
        },
      ],
      trial_period_days: 1,
    })

    await db.company.update({
      where: { id: companyId },
      data: {
        stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: customer.id,
        stripePriceId: subscription.items.data[0]?.price.id,
      },
    })
  } else {
    const subscription = await stripe.subscriptions.retrieve(
      companyUser?.company?.stripeSubscriptionId as string
    )
    await stripe.subscriptions.update(companyUser?.company?.stripeSubscriptionId as string, {
      proration_behavior: "none",
      items: [
        {
          id: subscription.items.data[0]?.id,
          price: plan?.priceId as string,
          quantity: 1,
        },
      ],
    })

    await db.company.update({
      where: { id: companyId },
      data: {
        stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
        stripeSubscriptionId: subscription.id,
        stripePriceId: subscription.items.data[0]?.price.id,
      },
    })
  }
}

export default provideTrail
