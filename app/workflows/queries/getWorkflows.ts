import Guard from "app/guard/ability"
import { paginate, resolver } from "blitz"
import db, { Prisma } from "db"

interface GetWorkflowsInput
  extends Pick<Prisma.WorkflowFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

const getWorkflows = resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetWorkflowsInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: workflows,
      hasMore,
      nextPage,
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
          include: {
            stages: true,
          },
        }),
    })

    return {
      workflows,
      nextPage,
      hasMore,
      count,
    }
  }
)

export default Guard.authorize("readAll", "workflow", getWorkflows)
