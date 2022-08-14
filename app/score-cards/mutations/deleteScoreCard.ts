import { resolver } from "blitz"
import db from "db"
import { z } from "zod"

const DeleteScoreCard = z.object({
  id: z.string(),
})

export default resolver.pipe(
  resolver.zod(DeleteScoreCard),
  resolver.authorize(),
  async ({ id }) => {
    const scoreCard = await db.scoreCard.findUnique({ where: { id } })

    // Don't allow deleting the Default Score card
    if (scoreCard?.name?.toLowerCase() === "default") {
      throw new Error("Cannot delete the 'Default' score card")
    }

    await db.scoreCardQuestion.deleteMany({ where: { scoreCardId: id } })
    const deletedScoreCard = await db.scoreCard.delete({ where: { id } })

    return deletedScoreCard
  }
)
