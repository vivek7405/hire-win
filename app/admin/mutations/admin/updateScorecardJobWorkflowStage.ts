import { Ctx } from "blitz"
import db, { Prisma } from "db"

type UpdateScorecardjobworkflowstageInput = Pick<
  Prisma.ScoreCardJobWorkflowStageUpdateArgs,
  "where" | "data"
>

async function updateScorecardJobWorkflowStage(
  { where, data }: UpdateScorecardjobworkflowstageInput,
  ctx: Ctx
) {
  ctx.session.$authorize("ADMIN")

  const scoreCardJobWorkflowStage = await db.scoreCardJobWorkflowStage.update({
    where,
    data,
  })

  return scoreCardJobWorkflowStage
}

export default updateScorecardJobWorkflowStage
