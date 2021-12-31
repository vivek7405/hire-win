import { paginate, Ctx } from "blitz"
import db, { Prisma } from "db"
import Guard from "app/guard/ability"

interface GetWorkflowStageInput
  extends Pick<Prisma.WorkflowStageFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

async function getWorkflowStages(
  { where, orderBy, skip = 0, take = 100 }: GetWorkflowStageInput,
  ctx: Ctx
) {
  ctx.session.$authorize()

  const {
    items: workflowStages,
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
        include: {
          stage: true,
        },
      }),
  })

  return {
    workflowStages,
    hasMore,
    count,
  }
}

export default Guard.authorize("readAll", "workflowStage", getWorkflowStages)
