import { paginate, Ctx } from "blitz"
import db, { Prisma } from "db"

interface GetCompanysInput
  extends Pick<Prisma.CompanyFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

async function getCompanys({ where, orderBy, skip = 0, take = 100 }: GetCompanysInput, ctx: Ctx) {
  ctx.session.$authorize("ADMIN")

  const {
    items: companys,
    hasMore,
    count,
  } = await paginate({
    skip,
    take,
    count: () => db.company.count({ where }),
    query: (paginateArgs) =>
      db.company.findMany({
        ...paginateArgs,
        where,
        orderBy,
      }),
  })

  return {
    companys,
    hasMore,
    count,
  }
}

export default getCompanys
