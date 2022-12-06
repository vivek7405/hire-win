import { Ctx } from "blitz"
import db from "db"
import Guard from "src/guard/ability"
import { ShiftDirection } from "types"
import range from "src/core/utils/range"

type ShiftJobStageInput = {
  jobId: string
  sourceOrder: number
  destOrder: number
}

async function shiftJobStage({ jobId, sourceOrder, destOrder }: ShiftJobStageInput, ctx: Ctx) {
  ctx.session.$authorize()

  const stages = await db.stage.findMany({
    where: {
      jobId: jobId,
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
  if (stages?.length === Math.abs(sourceOrder - destOrder) + 1) {
    stages.forEach((fq) => {
      if (fq.order === sourceOrder) {
        fq.order = destOrder
      } else {
        shiftDirection === ShiftDirection.UP ? (fq.order += 1) : (fq.order -= 1)
      }
    })

    const updateJobStages = await db.job.update({
      where: { id: jobId },
      data: {
        stages: {
          updateMany: stages?.map((ws) => {
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
    return updateJobStages
  } else {
    throw new Error("Order incorrect")
  }
}

export default shiftJobStage
// export default Guard.authorize("update", "workflow", shiftJobStage)
