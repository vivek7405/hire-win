import { Ctx } from "blitz"
import db, { Prisma } from "db"
import { User } from "@prisma/client"
import stripe from "app/core/utils/stripe"

type UpdateUserInput = Pick<Prisma.UserUpdateArgs, "where" | "data"> & {
  initial: User
}

async function updateUser({ where, data, initial }: UpdateUserInput, ctx: Ctx) {
  ctx.session.$authorize("ADMIN")

  const user = await db.user.update({
    where,
    data,
  })

  if (initial.stripePriceId !== data.stripePriceId) {
    if (!user.stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
      })

      const subscription = await stripe.subscriptions.create({
        customer: user.stripeCustomerId ? user.stripeCustomerId : customer.id,
        items: [
          {
            price: data.stripePriceId as string,
            quantity: 1, // user?.memberships.length,
          },
        ],
        // trial_period_days: 7,
      })

      await db.user.update({
        where,
        data: {
          stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: customer.id,
          stripePriceId: subscription.items.data[0]?.price.id,
        },
      })
    } else {
      const subscription = await stripe.subscriptions.retrieve(user?.stripeSubscriptionId as string)
      await stripe.subscriptions.update(user?.stripeSubscriptionId as string, {
        proration_behavior: "none",
        items: [
          {
            id: subscription.items.data[0]?.id,
            price: data.stripePriceId as string,
            quantity: 1, // user?.memberships.length,
          },
        ],
      })

      await db.user.update({
        where,
        data: {
          stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
          stripeSubscriptionId: subscription.id,
          stripePriceId: subscription.items.data[0]?.price.id,
        },
      })
    }
  }

  return user
}

export default updateUser
