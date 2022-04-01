import { resolver } from "blitz"
import db from "db"
import { z } from "zod"

const DeleteQuestion = z.object({
  id: z.string(),
})

export default resolver.pipe(resolver.zod(DeleteQuestion), resolver.authorize(), async ({ id }) => {
  const question = await db.question.deleteMany({ where: { id } })

  return question
})
