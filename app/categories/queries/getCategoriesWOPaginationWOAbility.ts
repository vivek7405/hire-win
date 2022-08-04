import { resolver } from "blitz"
import db, { Prisma } from "db"

interface GetCategoriesInput extends Pick<Prisma.CategoryFindManyArgs, "where"> {}

const getCategoriesWOPaginationWOAbility = resolver.pipe(
  resolver.authorize(),
  async ({ where }: GetCategoriesInput) => {
    const categories = await db.category.findMany({
      where,
      include: { jobs: { select: { id: true, archived: true } } },
      orderBy: { name: "asc" },
    })
    return categories
  }
)

export default getCategoriesWOPaginationWOAbility
