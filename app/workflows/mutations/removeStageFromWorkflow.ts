import { Ctx } from "blitz"
import db from "db"
import Guard from "app/guard/ability"
import { ShiftDirection } from "../types"

type RemoveStageFromWorkflowInput = {
  workflowId: string
  order: number
}

async function removeStageFromWorkflow(
  { workflowId, order }: RemoveStageFromWorkflowInput,
  ctx: Ctx
) {
  ctx.session.$authorize()

  // Get all stages with order greater than equal to the given order
  const workflowStages = await db.workflowStage.findMany({
    where: {
      workflowId: workflowId,
      order: {
        gte: order,
      },
    },
    orderBy: { order: "asc" },
  })

  if (workflowStages?.length > 0) {
    const deleteStage = await db.workflowStage.delete({
      where: {
        workflowId_stageId_order: {
          workflowId: workflowId,
          stageId: workflowStages[0]!.stageId,
          order: order,
        },
      },
    })

    // Length will be 1 if it was the last stage
    if (workflowStages.length > 1) {
      // First stage is deleted so slice it off and get the remaining stages to reorder
      const workflowStagesToReorder = workflowStages.slice(1)

      workflowStagesToReorder.forEach((ws) => {
        ws.order -= 1
      })

      const updateWorkflowStages = await db.workflow.update({
        where: { id: workflowId },
        data: {
          stages: {
            updateMany: workflowStagesToReorder?.map((ws) => {
              return {
                where: {
                  id: ws.id,
                },
                data: {
                  order: ws.order,
                },
              }
            }),
          },
        },
      })
      return [deleteStage, updateWorkflowStages]
    }
  } else {
    throw new Error("Incorrect stage details passed")
  }

  return null
}

export default Guard.authorize("update", "workflow", removeStageFromWorkflow)
