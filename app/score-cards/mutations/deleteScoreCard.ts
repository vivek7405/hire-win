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
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const ScoreCard = await db.scoreCard.deleteMany({ where: { id } })

    return ScoreCard
  }
)
