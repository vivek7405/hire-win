import { resolver } from "blitz"
import db, { Prisma } from "db"

interface GetCategoriesInput extends Pick<Prisma.CategoryFindManyArgs, "where"> {}

export default resolver.pipe(resolver.authorize(), async ({ where }: GetCategoriesInput) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const categories = await db.category.findMany({ where })

  return categories
})
