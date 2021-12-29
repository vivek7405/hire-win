import Guard from "app/guard/ability"
import { resolver, NotFoundError } from "blitz"
import db from "db"
import { z } from "zod"

const GetStage = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.string().optional().refine(Boolean, "Required"),
})

const getStage = resolver.pipe(resolver.zod(GetStage), resolver.authorize(), async ({ id }) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const stage = await db.stage.findFirst({ where: { id }, include: { workflows: true } })

  if (!stage) throw new NotFoundError()

  return stage
})

export default Guard.authorize("read", "stage", getStage)
