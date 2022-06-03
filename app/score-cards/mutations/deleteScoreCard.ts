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
    const scoreCardQuestion = await db.scoreCardQuestion.deleteMany({ where: { scoreCardId: id } })
    const scoreCard = await db.scoreCard.delete({ where: { id } })

    return scoreCard
  }
)
