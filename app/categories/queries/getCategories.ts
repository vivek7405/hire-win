import Guard from "app/guard/ability"
import { paginate, resolver } from "blitz"
import db, { Prisma } from "db"

interface GetCategoriesInput
  extends Pick<Prisma.CategoryFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

const getCategories = resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetCategoriesInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: categories,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.category.count({ where }),
      query: (paginateArgs) =>
        db.category.findMany({
          ...paginateArgs,
          where,
          include: { jobs: { select: { id: true, archived: true } } },
          orderBy: { name: "asc" },
        }),
    })

    return {
      categories,
      nextPage,
      hasMore,
      count,
    }
  }
)

export default Guard.authorize("readAll", "category", getCategories)
