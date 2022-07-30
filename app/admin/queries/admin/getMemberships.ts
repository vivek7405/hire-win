import { paginate, Ctx } from "blitz"
import db, { Prisma } from "db"

interface GetMembershipsInput
  extends Pick<Prisma.CompanyUserFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

async function getMemberships(
  { where, orderBy, skip = 0, take = 100 }: GetMembershipsInput,
  ctx: Ctx
) {
  ctx.session.$authorize("ADMIN")

  const {
    items: memberships,
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
    memberships,
    hasMore,
    count,
  }
}

export default getMemberships
