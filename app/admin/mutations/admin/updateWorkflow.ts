import { Ctx } from "blitz"
import db, { Prisma } from "db"

type UpdateWorkflowInput = Pick<Prisma.WorkflowUpdateArgs, "where" | "data">

async function updateWorkflow({ where, data }: UpdateWorkflowInput, ctx: Ctx) {
  ctx.session.$authorize("ADMIN")

  const workflow = await db.workflow.update({
    where,
    data,
  })

  return workflow
}

export default updateWorkflow
