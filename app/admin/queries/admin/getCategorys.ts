import { paginate, Ctx } from "blitz"
import db, { Prisma } from "db"

interface GetCategorysInput
  extends Pick<Prisma.CategoryFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

async function getCategorys({ where, orderBy, skip = 0, take = 100 }: GetCategorysInput, ctx: Ctx) {
  ctx.session.$authorize("ADMIN")

  const {
    items: categorys,
    hasMore,
    count,
  } = await paginate({
    skip,
    take,
    count: () => db.category.count({ where }),
    query: (paginateArgs) =>
      db.category.findMany({
        ...paginateArgs,
        where,
        orderBy,
      }),
  })

  return {
    categorys,
    hasMore,
    count,
  }
}

export default getCategorys
