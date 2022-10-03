import { Ctx } from "blitz"
import db, { Prisma } from "db"
import slugify from "slugify"
import { findFreeSlug } from "app/core/utils/findFreeSlug"
import { Company } from "db"
import stripe from "app/core/utils/stripe"

type UpdateCompanyInput = Pick<Prisma.CompanyUpdateArgs, "where" | "data"> & {
  initial: Company
}

async function updateCompany({ where, data, initial }: UpdateCompanyInput, ctx: Ctx) {
  ctx.session.$authorize("ADMIN")

  const slug = slugify(`${data.name}`, { strict: true })
  const newSlug: string = await findFreeSlug(
    slug,
    async (e) => await db.company.findFirst({ where: { slug: e } })
  )

  const company = await db.company.update({
    where,
    data: {
      ...data,
      slug: initial.name !== data.name ? newSlug : initial.slug,
    },
    include: {
      users: {
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
    const owner = company?.users.filter((m) => m.role === "OWNER")

    if (!company.stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: owner![0]?.user.email,
      })

      const subscription = await stripe.subscriptions.create({
        customer: company.stripeCustomerId ? company.stripeCustomerId : customer.id,
        items: [
          {
            price: data.stripePriceId as string,
            quantity: company?.users.length,
          },
        ],
        trial_period_days: 14,
      })

      await db.company.update({
        where,
        data: {
          stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: customer.id,
          stripePriceId: subscription.items.data[0]?.price.id,
        },
      })
    } else {
      const subscription = await stripe.subscriptions.retrieve(
        company?.stripeSubscriptionId as string
      )
      await stripe.subscriptions.update(company?.stripeSubscriptionId as string, {
        proration_behavior: "none",
        items: [
          {
            id: subscription.items.data[0]?.id,
            price: data.stripePriceId as string,
            quantity: company?.users.length,
          },
        ],
      })

      await db.company.update({
        where,
        data: {
          stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
          stripeSubscriptionId: subscription.id,
          stripePriceId: subscription.items.data[0]?.price.id,
        },
      })
    }
  }

  return company
}

export default updateCompany
