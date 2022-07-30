import { Ctx } from "blitz"
import db, { Prisma } from "db"

type UpdateScorecardjobworkflowstageInput = Pick<
  Prisma.ScoreCardJobWorkflowStageUpdateArgs,
  "where" | "data"
>

async function updateScorecardjobworkflowstage(
  { where, data }: UpdateScorecardjobworkflowstageInput,
  ctx: Ctx
) {
  ctx.session.$authorize("ADMIN")

  const scorecardjobworkflowstage = await db.scoreCardJobWorkflowStage.update({
    where,
    data,
  })

  return scorecardjobworkflowstage
}

export default updateScorecardjobworkflowstage
