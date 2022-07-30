import { paginate, Ctx } from "blitz"
import db, { Prisma } from "db"

interface GetScorecardjobworkflowstagesInput
  extends Pick<
    Prisma.ScoreCardJobWorkflowStageFindManyArgs,
    "where" | "orderBy" | "skip" | "take"
  > {}

async function getScorecardjobworkflowstages(
  { where, orderBy, skip = 0, take = 100 }: GetScorecardjobworkflowstagesInput,
  ctx: Ctx
) {
  ctx.session.$authorize("ADMIN")

  const {
    items: scorecardjobworkflowstages,
    hasMore,
    count,
  } = await paginate({
    skip,
    take,
    count: () => db.scoreCardJobWorkflowStage.count({ where }),
    query: (paginateArgs) =>
      db.scoreCardJobWorkflowStage.findMany({
        ...paginateArgs,
        where,
        orderBy,
      }),
  })

  return {
    scorecardjobworkflowstages,
    hasMore,
    count,
  }
}

export default getScorecardjobworkflowstages
