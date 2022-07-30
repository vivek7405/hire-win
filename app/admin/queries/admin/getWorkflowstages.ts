import { paginate, Ctx } from "blitz"
import db, { Prisma } from "db"

interface GetWorkflowstagesInput
  extends Pick<Prisma.WorkflowStageFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

async function getWorkflowstages(
  { where, orderBy, skip = 0, take = 100 }: GetWorkflowstagesInput,
  ctx: Ctx
) {
  ctx.session.$authorize("ADMIN")

  const {
    items: workflowstages,
    hasMore,
    count,
  } = await paginate({
    skip,
    take,
    count: () => db.workflowStage.count({ where }),
    query: (paginateArgs) =>
      db.workflowStage.findMany({
        ...paginateArgs,
        where,
        orderBy,
      }),
  })

  return {
    workflowstages,
    hasMore,
    count,
  }
}

export default getWorkflowstages
