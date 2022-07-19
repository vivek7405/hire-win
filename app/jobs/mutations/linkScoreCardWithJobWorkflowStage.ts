import { Ctx, AuthenticationError } from "blitz"
import db from "db"
import slugify from "slugify"
import { Job, JobInputType } from "app/jobs/validations"
import Guard from "app/guard/ability"
import { findFreeSlug } from "app/core/utils/findFreeSlug"
import { JobUserRole, ScoreCard } from "@prisma/client"
import { ExtendedScoreCard } from "types"

type linkScoreCardWithJobWorkflowStageProps = {
  jobId: string
  workflowStageId: string
  scoreCardId?: string // Default Score Card will be linked if no scoreCardId is passed
}
async function linkScoreCardWithJobWorkflowStage(
  data: linkScoreCardWithJobWorkflowStageProps,
  ctx: Ctx
) {
  ctx.session.$authorize()

  const { jobId, workflowStageId, scoreCardId } = data

  // const user = await db.user.findFirst({ where: { id: ctx.session.userId! } })
  // if (!user) throw new AuthenticationError()

  const defaultScoreCard: ExtendedScoreCard | null = await db.scoreCard.findFirst({
    where: { companyId: ctx.session.companyId || "0", name: "Default" },
    include: {
      cardQuestions: {
        include: {
          cardQuestion: true,
          scoreCard: { include: { jobWorkflowStages: true } },
          scores: { include: { candidate: true } },
        },
      },
    },
  })

  const scoreCard: ExtendedScoreCard | null = await db.scoreCard.findFirst({
    where: { companyId: ctx.session.companyId || "0", id: scoreCardId || "0" },
    include: {
      cardQuestions: {
        include: {
          cardQuestion: true,
          scoreCard: { include: { jobWorkflowStages: true } },
          scores: { include: { candidate: true } },
        },
      },
    },
  })

  // const workflowStage = await db.workflowStage.findFirst({ where: { id: workflowStageId } })

  await db.job.update({
    where: { id: jobId },
    data: {
      scoreCards: {
        create: {
          scoreCardId: (scoreCard?.id || defaultScoreCard?.id)!,
          workflowStageId: workflowStageId!,
        },
      },
    },
  })

  return scoreCard || defaultScoreCard
}

export default linkScoreCardWithJobWorkflowStage
// export default Guard.authorize("update", "job", linkScoreCardWithJobWorkflowStage)
