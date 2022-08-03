import { Ctx } from "blitz"
import Guard from "app/guard/ability"
import db, { CompanyUserRole, JobUserRole } from "db"

interface RemoveFromCompanyInput {
  companyId: string
  userId: string
}

async function removeFromCompany({ companyId, userId }: RemoveFromCompanyInput, ctx: Ctx) {
  ctx.session.$authorize()

  // Find jobs owned by user and transfer ownership to company owner
  const jobUsersWhereOwner = await db.jobUser.findMany({
    where: {
      userId,
      role: JobUserRole.OWNER,
    },
  })
  if (jobUsersWhereOwner) {
    const companyUserOwner = await db.companyUser.findFirst({
      where: {
        companyId,
        role: CompanyUserRole.OWNER,
      },
    })
    // transfer ownership of all those jobs to company owner
    await db.jobUser.updateMany({
      where: {
        userId: companyUserOwner?.userId,
        jobId: { in: jobUsersWhereOwner.map((ju) => ju.jobId) },
      },
      data: {
        role: JobUserRole.OWNER,
      },
    })
  }

  const jobUsersToDelete = await db.jobUser.findMany({ where: { userId } })
  await db.jobUser.deleteMany({
    where: {
      userId: { in: jobUsersToDelete?.map((ju) => ju.userId) },
    },
  })

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
