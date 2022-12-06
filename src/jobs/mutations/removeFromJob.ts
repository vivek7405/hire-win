import { Ctx } from "blitz"
import Guard from "src/guard/ability"
import db, { CompanyUserRole } from "db"
import stripe from "src/core/utils/stripe"

interface InviteToJobInput {
  jobId: string
  userId: string
}

async function removeFromJob({ jobId, userId }: InviteToJobInput, ctx: Ctx) {
  ctx.session.$authorize()

  const jobUser = await db.jobUser.findFirst({
    where: {
      job: {
        id: jobId,
      },
      user: {
        id: userId,
      },
    },
    include: { job: true },
  })

  if (jobUser) {
    const companyUserOwner = await db.companyUser.findFirst({
      where: {
        companyId: jobUser?.job.companyId,
        role: CompanyUserRole.OWNER,
      },
    })

    // Assign company owner as interviewer instead of the user being removed
    // Job Workflow Stage Level - InterviewDetail
    // Candidate Level - CandidateWorkflowStageInterviewer
    await db.stage.updateMany({
      where: { interviewerId: userId, jobId },
      data: { interviewerId: companyUserOwner?.userId },
    })
    await db.candidateStageInterviewer.updateMany({
      where: { interviewerId: userId, candidate: { jobId } },
      data: { interviewerId: companyUserOwner?.userId },
    })

    await db.jobUser.delete({
      where: {
        id: jobUser?.id,
      },
    })
  }

  // const job = await db.job.findFirst({
  //   where: {
  //     id: jobId,
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
  //         quantity: job?.jobUsers.length,
  //       },
  //     ],
  //   })
  // }
}

export default Guard.authorize("inviteUser", "job", removeFromJob)
