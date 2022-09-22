import { Ctx } from "blitz"
import db from "db"
import Guard from "app/guard/ability"

type removeStageFromJobInput = {
  jobId: string
  order: number
}

async function removeStageFromJob({ jobId, order }: removeStageFromJobInput, ctx: Ctx) {
  ctx.session.$authorize()

  // Get all stages with order greater than equal to the given order
  const stages = await db.stage.findMany({
    where: {
      jobId,
      order: {
        gte: order,
      },
    },
    orderBy: { order: "asc" },
  })

  if (stages?.length > 0) {
    const stageIdToDelete = await db.stage.findFirst({
      where: { jobId, order },
    })

    const deleteStage = await db.stage.delete({
      where: { id: stageIdToDelete?.id || "0" },
    })

    // Length will be 1 if it was the last stage
    if (stages.length > 1) {
      // First stage is deleted so slice it off and get the remaining stages to reorder
      const stagesToReorder = stages.slice(1)

      stagesToReorder.forEach((ws) => {
        ws.order -= 1
      })

      const updateStages = await db.job.update({
        where: { id: jobId },
        data: {
          stages: {
            updateMany: stagesToReorder?.map((stage) => {
              return {
                where: {
                  id: stage.id,
                },
                data: {
                  order: stage.order,
                },
              }
            }),
          },
        },
      })
      return [deleteStage, updateStages]
    }
  } else {
    throw new Error("Incorrect stage details passed")
  }

  return null
}

export default Guard.authorize("update", "workflow", removeStageFromJob)
