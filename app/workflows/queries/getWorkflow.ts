import Guard from "app/guard/ability"
import { resolver, NotFoundError } from "blitz"
import db from "db"
import { z } from "zod"

const GetWorkflow = z.object({
  // This accepts type of undefined, but is required at runtime
  slug: z.string().optional().refine(Boolean, "Required"),
})

const getWorkflow = resolver.pipe(
  resolver.zod(GetWorkflow),
  resolver.authorize(),
  async ({ slug }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const workflow = await db.workflow.findFirst({ where: { slug }, include: { stages: true } })

    if (!workflow) throw new NotFoundError()

    return workflow
  }
)

export default Guard.authorize("read", "workflow", getWorkflow)
