import { paginate, Ctx } from "blitz"
import db, { Prisma } from "db"

interface GetCompanyusersInput
  extends Pick<Prisma.CompanyUserFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

async function getCompanyusers(
  { where, orderBy, skip = 0, take = 100 }: GetCompanyusersInput,
  ctx: Ctx
) {
  ctx.session.$authorize("ADMIN")

  const {
    items: companyusers,
    hasMore,
    count,
  } = await paginate({
    skip,
    take,
    count: () => db.companyUser.count({ where }),
    query: (paginateArgs) =>
      db.companyUser.findMany({
        ...paginateArgs,
        where,
        orderBy,
      }),
  })

  return {
    companyusers,
    hasMore,
    count,
  }
}

export default getCompanyusers
