import { Ctx } from "blitz"
import db, { Prisma } from "db"

type UpdateWorkflowstageInput = Pick<Prisma.WorkflowStageUpdateArgs, "where" | "data">

async function updateWorkflowstage({ where, data }: UpdateWorkflowstageInput, ctx: Ctx) {
  ctx.session.$authorize("ADMIN")

  const workflowstage = await db.workflowStage.update({
    where,
    data,
  })

  return workflowstage
}

export default updateWorkflowstage
