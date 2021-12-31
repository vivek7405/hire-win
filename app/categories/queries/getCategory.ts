import Guard from "app/guard/ability"
import { resolver, NotFoundError } from "blitz"
import db, { Prisma } from "db"
import { z } from "zod"

// const GetCategory = z.object({
//   // This accepts type of undefined, but is required at runtime
//   slug: z.string().optional().refine(Boolean, "Required"),
// })

interface GetCategoryInput extends Pick<Prisma.CategoryFindFirstArgs, "where"> {}

const getCategory = resolver.pipe(resolver.authorize(), async ({ where }) => {
  const category = await db.category.findFirst({ where, include: { jobs: true } })

  if (!category) throw new NotFoundError()

  return category
})

export default Guard.authorize("read", "category", getCategory)
