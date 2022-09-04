import getPlansByCurrency from "app/plans/queries/getPlansByCurrency"
import db from "db"
import { Currency, PlanFrequency } from "types"
import stripe from "./stripe"

async function provideTrail(userId: string, companyId: string, currency: Currency) {
  const companyUser = await db.companyUser.findFirst({
    where: { userId, companyId },
    include: { company: true, user: true },
  })

  if (!companyUser) return

  const plans = await getPlansByCurrency({ currency })
  const plan = plans?.find((plan) => plan.frequency === PlanFrequency.MONTHLY)

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
      trial_period_days: 30,
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
