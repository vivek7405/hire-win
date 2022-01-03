import { resolver } from "blitz"
import db from "db"
import { z } from "zod"

const DeleteQuestion = z.object({
  id: z.string(),
})

export default resolver.pipe(resolver.zod(DeleteQuestion), resolver.authorize(), async ({ id }) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const stage = await db.stage.deleteMany({ where: { id } })

  return stage
})
