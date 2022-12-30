import db from "db"
import { Currency, PlanFrequency } from "types"
import stripe from "./stripe"
import moment from "moment"
import allPlans from "src/plans/utils/allPlans"

async function provideTrail(userId: string, companyId: string, currency: Currency) {
  const companyUser = await db.companyUser.findFirst({
    where: { userId, companyId },
    include: { company: true, user: true },
  })

  if (!companyUser) return

  const plan = allPlans?.find((plan) => plan.frequency === PlanFrequency.MONTHLY)

  if (!companyUser?.user.stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: companyUser?.user.email,
    })

    const subscription = await stripe.subscriptions.create({
      customer: companyUser?.user?.stripeCustomerId
        ? companyUser?.user?.stripeCustomerId
        : customer.id,
      items: [
        {
          price: plan?.priceId as string,
          quantity: 1,
        },
      ],
      metadata: { userId },
      trial_period_days: 14,
    })

    await db.user.update({
      where: { id: userId },
      data: {
        stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: customer.id,
        stripePriceId: subscription.items.data[0]?.price.id,
        stripeTrialStart: subscription.trial_start
          ? moment.unix(subscription.trial_start)?.utc()?.toDate()
          : null,
        stripeTrialEnd: subscription.trial_end
          ? moment.unix(subscription.trial_end)?.utc()?.toDate()
          : null,
      },
    })
  } else {
    const subscription = await stripe.subscriptions.retrieve(
      companyUser?.user?.stripeSubscriptionId as string
    )
    await stripe.subscriptions.update(companyUser?.user?.stripeSubscriptionId as string, {
      proration_behavior: "none",
      items: [
        {
          id: subscription.items.data[0]?.id,
          price: plan?.priceId as string,
          quantity: 1,
        },
      ],
    })

    await db.user.update({
      where: { id: userId },
      data: {
        stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
        stripeSubscriptionId: subscription.id,
        stripePriceId: subscription.items.data[0]?.price.id,
        stripeTrialStart: subscription.trial_start
          ? moment.unix(subscription.trial_start)?.utc()?.toDate()
          : null,
        stripeTrialEnd: subscription.trial_end
          ? moment.unix(subscription.trial_end)?.utc()?.toDate()
          : null,
      },
    })
  }
}

export default provideTrail
