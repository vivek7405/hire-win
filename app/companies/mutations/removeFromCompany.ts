import { Ctx } from "blitz"
import Guard from "app/guard/ability"
import db from "db"

interface RemoveFromCompanyInput {
  companyId: number
  userId: number
}

async function removeFromCompany({ companyId, userId }: RemoveFromCompanyInput, ctx: Ctx) {
  ctx.session.$authorize()

  const companyUser = await db.companyUser.findFirst({
    where: {
      company: {
        id: companyId,
      },
      user: {
        id: userId,
      },
    },
  })

  await db.companyUser.delete({
    where: {
      id: companyUser?.id,
    },
  })

  // const company = await db.company.findFirst({
  //   where: {
  //     id: companyId,
  //   },
  //   include: {
  //     users: true,
  //   },
  // })

  // if (job?.stripeSubscriptionId) {
  //   const subscription = await stripe.subscriptions.retrieve(job?.stripeSubscriptionId as string)
  //   await stripe.subscriptions.update(job?.stripeSubscriptionId as string, {
  //     proration_behavior: "none",
  //     items: [
  //       {
  //         id: subscription.items.data[0]?.id,
  //         quantity: job?.memberships.length,
  //       },
  //     ],
  //   })
  // }
}

export default Guard.authorize("inviteUser", "company", removeFromCompany)
