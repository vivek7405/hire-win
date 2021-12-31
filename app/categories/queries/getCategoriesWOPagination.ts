import Guard from "app/guard/ability"
import { resolver } from "blitz"
import db, { Prisma } from "db"

interface GetCategoriesInput extends Pick<Prisma.CategoryFindManyArgs, "where"> {}

const getCategoriesWOPagination = resolver.pipe(
  resolver.authorize(),
  async ({ where }: GetCategoriesInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const categories = await db.category.findMany({ where })

    return categories
  }
)

export default Guard.authorize("readAll", "category", getCategoriesWOPagination)
