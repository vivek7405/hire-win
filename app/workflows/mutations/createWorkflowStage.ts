import { Ctx, AuthenticationError } from "blitz"
import db from "db"
import { WorkflowStage, WorkflowStageInputType } from "app/workflows/validations"
import Guard from "app/guard/ability"
import shiftWorkflowStage from "./shiftWorkflowStage"

async function createWorkflowStage(data: WorkflowStageInputType, ctx: Ctx) {
  ctx.session.$authorize()

  const { workflowId, stageId } = WorkflowStage.parse(data)
  const user = await db.user.findFirst({ where: { id: ctx.session.userId! } })
  if (!user) throw new AuthenticationError()

  const order = (await db.workflowStage.count({ where: { workflowId: workflowId } })) + 1

  // Add stage to the last position
  const workflowStage = await db.workflowStage.create({
    data: {
      order: order,
      workflowId: workflowId!,
      stageId: stageId,
    },
  })

  // After adding stage to the last position, shift it up
  await shiftWorkflowStage(
    { workflowId: workflowId!, sourceOrder: order, destOrder: order - 1 },
    ctx
  )

  return workflowStage
}

export default Guard.authorize("create", "workflowStage", createWorkflowStage)
