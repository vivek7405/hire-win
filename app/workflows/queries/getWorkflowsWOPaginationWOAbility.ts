import { resolver } from "blitz"
import db, { Prisma } from "db"

interface GetWorkflowsInput extends Pick<Prisma.WorkflowFindManyArgs, "where"> {}

const getWorkflowsWOPaginationWOAbility = resolver.pipe(
  resolver.authorize(),
  async ({ where }: GetWorkflowsInput) => {
    const workflows = await db.workflow.findMany({
      where,
      include: {
        stages: {
          include: { stage: true, scoreCards: { include: { scoreCard: true } } },
          orderBy: { order: "asc" },
        },
        jobs: true,
      },
      orderBy: { createdAt: "asc" },
    })
    return workflows
  }
)

export default getWorkflowsWOPaginationWOAbility
