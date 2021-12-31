import { Ctx, AuthenticationError } from "blitz"
import db from "db"
import { WorkflowStage, WorkflowStageInputType } from "app/workflows/validations"
import Guard from "app/guard/ability"

async function createWorkflowStage(data: WorkflowStageInputType, ctx: Ctx) {
  ctx.session.$authorize()

  const { workflowId, stageId } = WorkflowStage.parse(data)
  const user = await db.user.findFirst({ where: { id: ctx.session.userId! } })
  if (!user) throw new AuthenticationError()

  const order = (await db.workflowStage.count({ where: { workflowId: workflowId } })) + 1

  const workflowStage = await db.workflowStage.create({
    data: {
      order: order,
      workflowId: workflowId!,
      stageId: stageId,
      userId: user.id,
    },
  })

  return workflowStage
}

export default Guard.authorize("create", "workflowStage", createWorkflowStage)
