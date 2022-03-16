import { Ctx, AuthenticationError } from "blitz"
import db from "db"
import { WorkflowStages, WorkflowStagesInputType } from "app/workflows/validations"
import Guard from "app/guard/ability"
import factoryWorkflowStages from "app/stages/utils/factoryWorkflowStages"

async function addExistingWorkflowStages(data: WorkflowStagesInputType, ctx: Ctx) {
  ctx.session.$authorize()

  const { workflowId, stageIds } = WorkflowStages.parse(data)
  const user = await db.user.findFirst({ where: { id: ctx.session.userId! } })
  if (!user) throw new AuthenticationError()

  const workflowStagesLength = await db.workflowStage.count({ where: { workflowId: workflowId } })

  // This will duplicate the order of the last workflow stage
  // which will be taken care below by shifting to the last position
  const workflow = await db.workflow.update({
    where: { id: workflowId },
    data: {
      stages: {
        createMany: {
          data: stageIds.map((sId, index) => {
            return {
              order: workflowStagesLength + index,
              stageId: sId,
            }
          }),
        },
      },
    },
  })

  const workflowStageToShiftAtLast = await db.workflowStage.findFirst({
    where: {
      workflowId,
      stage: {
        name: factoryWorkflowStages[factoryWorkflowStages.length - 1]?.stage.name,
      },
    },
    include: {
      stage: true,
    },
  })

  if (workflowStageToShiftAtLast) {
    await db.workflowStage.update({
      where: {
        id: workflowStageToShiftAtLast.id,
      },
      data: {
        order: workflowStageToShiftAtLast.order + stageIds.length,
      },
    })
  }

  return workflow
}

export default Guard.authorize("create", "workflowStage", addExistingWorkflowStages)
