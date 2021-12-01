import { paginate, Ctx } from "blitz"
import db, { Prisma } from "db"

interface GetSessionsInput
  extends Pick<Prisma.SessionFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

async function getSessions({ where, orderBy, skip = 0, take = 100 }: GetSessionsInput, ctx: Ctx) {
  ctx.session.$authorize("ADMIN")

  const {
    items: sessions,
    hasMore,
    count,
  } = await paginate({
    skip,
    take,
    count: () => db.session.count({ where }),
    query: (paginateArgs) =>
      db.session.findMany({
        ...paginateArgs,
        where,
        orderBy,
      }),
  })

  return {
    sessions,
    hasMore,
    count,
  }
}

export default getSessions
