import { Ctx } from "blitz"
import db, { Prisma } from "db"
import slugify from "slugify"
import { findFreeSlug } from "app/core/utils/findFreeSlug"
import { Job } from "db"
import stripe from "app/core/utils/stripe"

type UpdateJobInput = Pick<Prisma.JobUpdateArgs, "where" | "data"> & {
  initial: Job
}

async function updateJob({ where, data, initial }: UpdateJobInput, ctx: Ctx) {
  ctx.session.$authorize("ADMIN")

  const slug = slugify(`${data.name}`, { strict: true })
  const newSlug: string = await findFreeSlug(
    slug,
    async (e) => await db.job.findFirst({ where: { slug: e } })
  )

  const job = await db.job.update({
    where,
    data: {
      ...data,
      slug: initial.name !== data.name ? newSlug : initial.slug,
    },
    include: {
      memberships: {
        include: {
          user: {
            select: {
              email: true,
            },
          },
        },
      },
    },
  })

  if (initial.stripePriceId !== data.stripePriceId) {
    const owner = job?.memberships.filter((m) => m.role === "OWNER")

    if (!job.stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: owner![0]?.user.email,
      })

      const subscription = await stripe.subscriptions.create({
        customer: job.stripeCustomerId ? job.stripeCustomerId : customer.id,
        items: [
          {
            price: data.stripePriceId as string,
            quantity: job?.memberships.length,
          },
        ],
        trial_period_days: 7,
      })

      await db.job.update({
        where,
        data: {
          stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: customer.id,
          stripePriceId: subscription.items.data[0]?.price.id,
        },
      })
    } else {
      const subscription = await stripe.subscriptions.retrieve(job?.stripeSubscriptionId as string)
      await stripe.subscriptions.update(job?.stripeSubscriptionId as string, {
        proration_behavior: "none",
        items: [
          {
            id: subscription.items.data[0]?.id,
            price: data.stripePriceId as string,
            quantity: job?.memberships.length,
          },
        ],
      })

      await db.job.update({
        where,
        data: {
          stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
          stripeSubscriptionId: subscription.id,
          stripePriceId: subscription.items.data[0]?.price.id,
        },
      })
    }
  }

  return job
}

export default updateJob
