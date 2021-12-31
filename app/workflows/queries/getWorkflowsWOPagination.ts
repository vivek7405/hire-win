import Guard from "app/guard/ability"
import { resolver } from "blitz"
import db, { Prisma } from "db"

interface GetWorkflowsInput extends Pick<Prisma.WorkflowFindManyArgs, "where"> {}

const getWorkflowsWOPagination = resolver.pipe(
  resolver.authorize(),
  async ({ where }: GetWorkflowsInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const workflows = await db.workflow.findMany({ where })
    return workflows
  }
)

export default Guard.authorize("readAll", "workflow", getWorkflowsWOPagination)
