import Guard from "app/guard/ability"
import { resolver } from "blitz"
import db, { Prisma } from "db"

interface GetCategoriesInput extends Pick<Prisma.CategoryFindManyArgs, "where"> {}

const getCategoriesWOPagination = resolver.pipe(
  resolver.authorize(),
  async ({ where }: GetCategoriesInput) => {
    const categories = await db.category.findMany({
      where,
      include: { jobs: true },
    })
    return categories
  }
)

export default Guard.authorize("readAll", "category", getCategoriesWOPagination)
