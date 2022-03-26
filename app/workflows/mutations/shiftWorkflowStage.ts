import { Ctx } from "blitz"
import db from "db"
import Guard from "app/guard/ability"
import { ShiftDirection } from "types"
import range from "app/core/utils/range"

type ShiftWorkflowStageInput = {
  workflowId: string
  sourceOrder: number
  destOrder: number
}

async function shiftWorkflowStage(
  { workflowId, sourceOrder, destOrder }: ShiftWorkflowStageInput,
  ctx: Ctx
) {
  ctx.session.$authorize()

  const workflowStages = await db.workflowStage.findMany({
    where: {
      workflowId: workflowId,
      order: {
        in:
          sourceOrder < destOrder
            ? range(sourceOrder, destOrder, 1)
            : range(destOrder, sourceOrder, 1),
      },
    },
    orderBy: { order: "asc" },
  })

  const shiftDirection = sourceOrder < destOrder ? ShiftDirection.DOWN : ShiftDirection.UP
  if (workflowStages?.length === Math.abs(sourceOrder - destOrder) + 1) {
    workflowStages.forEach((fq) => {
      if (fq.order === sourceOrder) {
        fq.order = destOrder
      } else {
        shiftDirection === ShiftDirection.UP ? (fq.order += 1) : (fq.order -= 1)
      }
    })

    const updateWorkflowStages = await db.workflow.update({
      where: { id: workflowId },
      data: {
        stages: {
          updateMany: workflowStages?.map((ws) => {
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
