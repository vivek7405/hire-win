import { resolver } from "blitz"
import db from "db"
import { z } from "zod"

const DeleteCardQuestion = z.object({
  id: z.string(),
})

export default resolver.pipe(
  resolver.zod(DeleteCardQuestion),
  resolver.authorize(),
  async ({ id }) => {
    const cardQuestion = await db.cardQuestion.deleteMany({ where: { id } })
    return cardQuestion
  }
)
