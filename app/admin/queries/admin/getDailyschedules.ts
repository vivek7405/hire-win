import { paginate, Ctx } from "blitz"
import db, { Prisma } from "db"

interface GetDailyschedulesInput
  extends Pick<Prisma.DailyScheduleFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

async function getDailyschedules(
  { where, orderBy, skip = 0, take = 100 }: GetDailyschedulesInput,
  ctx: Ctx
) {
  ctx.session.$authorize("ADMIN")

  const {
    items: dailyschedules,
    hasMore,
    count,
  } = await paginate({
    skip,
    take,
    count: () => db.dailySchedule.count({ where }),
    query: (paginateArgs) =>
      db.dailySchedule.findMany({
        ...paginateArgs,
        where,
        orderBy,
      }),
  })

  return {
    dailyschedules,
    hasMore,
    count,
  }
}

export default getDailyschedules
