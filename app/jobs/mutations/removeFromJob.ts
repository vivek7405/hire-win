import { Ctx } from "blitz"
import Guard from "app/guard/ability"
import db from "db"
import stripe from "app/core/utils/stripe"

interface InviteToJobInput {
  jobId: string
  userId: number
}

async function removeFromJob({ jobId, userId }: InviteToJobInput, ctx: Ctx) {
  ctx.session.$authorize()

  const membership = await db.jobUser.findFirst({
    where: {
      job: {
        id: jobId,
      },
      user: {
        id: userId,
      },
    },
  })

  await db.jobUser.delete({
    where: {
      id: membership?.id,
    },
  })

  const job = await db.job.findFirst({
    where: {
      id: jobId,
    },
    include: {
      users: true,
    },
  })

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

export default Guard.authorize("inviteUser", "job", removeFromJob)
