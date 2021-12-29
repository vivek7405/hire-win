import Guard from "app/guard/ability"
import { resolver, NotFoundError } from "blitz"
import db from "db"
import { z } from "zod"

const GetCategory = z.object({
  // This accepts type of undefined, but is required at runtime
  slug: z.string().optional().refine(Boolean, "Required"),
})

const getCategory = resolver.pipe(
  resolver.zod(GetCategory),
  resolver.authorize(),
  async ({ slug }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const category = await db.category.findFirst({ where: { slug }, include: { jobs: true } })

    if (!category) throw new NotFoundError()

    return category
  }
)

export default Guard.authorize("read", "category", getCategory)
