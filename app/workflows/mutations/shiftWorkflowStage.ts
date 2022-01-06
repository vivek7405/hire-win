import { Ctx } from "blitz"
import db from "db"
import Guard from "app/guard/ability"
import { ShiftDirection } from "types"

type ShiftWorkflowStageInput = {
  workflowId: string
  order: number
  shiftDirection: ShiftDirection
}

async function shiftWorkflowStage(
  { workflowId, order, shiftDirection }: ShiftWorkflowStageInput,
  ctx: Ctx
) {
  ctx.session.$authorize()

  const workflowStages = await db.workflowStage.findMany({
    where: {
      workflowId: workflowId,
      order: {
        in: shiftDirection === ShiftDirection.UP ? [order, order - 1] : [order, order + 1],
      },
    },
    orderBy: { order: "asc" },
  })

  if (workflowStages?.length === 2) {
    workflowStages[0]!.order += 1
    workflowStages[1]!.order -= 1

    const updateWorkflowStages = await db.workflow.update({
      where: { id: workflowId },
      data: {
        stages: {
          update: workflowStages?.map((ws) => {
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
    return updateWorkflowStages
  } else {
    throw new Error("Order incorrect")
  }
}

export default Guard.authorize("update", "workflow", shiftWorkflowStage)
