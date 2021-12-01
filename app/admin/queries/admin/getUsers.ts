import { paginate, Ctx } from "blitz"
import db, { Prisma } from "db"

interface GetUsersInput
  extends Pick<Prisma.UserFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

async function getUsers({ where, orderBy, skip = 0, take = 100 }: GetUsersInput, ctx: Ctx) {
  ctx.session.$authorize("ADMIN")

  const {
    items: users,
    hasMore,
    count,
  } = await paginate({
    skip,
    take,
    count: () => db.user.count({ where }),
    query: (paginateArgs) =>
      db.user.findMany({
        ...paginateArgs,
        where,
        orderBy,
      }),
  })

  return {
    users,
    hasMore,
    count,
  }
}

export default getUsers
