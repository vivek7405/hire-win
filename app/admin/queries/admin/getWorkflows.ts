import { paginate, Ctx } from "blitz"
import db, { Prisma } from "db"

interface GetWorkflowsInput
  extends Pick<Prisma.WorkflowFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

async function getWorkflows({ where, orderBy, skip = 0, take = 100 }: GetWorkflowsInput, ctx: Ctx) {
  ctx.session.$authorize("ADMIN")

  const {
    items: workflows,
    hasMore,
    count,
  } = await paginate({
    skip,
    take,
    count: () => db.workflow.count({ where }),
    query: (paginateArgs) =>
      db.workflow.findMany({
        ...paginateArgs,
        where,
        orderBy,
      }),
  })

  return {
    workflows,
    hasMore,
    count,
  }
}

export default getWorkflows
