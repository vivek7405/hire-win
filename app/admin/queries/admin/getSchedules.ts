import { paginate, Ctx } from "blitz"
import db, { Prisma } from "db"

interface GetSchedulesInput
  extends Pick<Prisma.ScheduleFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

async function getSchedules({ where, orderBy, skip = 0, take = 100 }: GetSchedulesInput, ctx: Ctx) {
  ctx.session.$authorize("ADMIN")

  const {
    items: schedules,
    hasMore,
    count,
  } = await paginate({
    skip,
    take,
    count: () => db.schedule.count({ where }),
    query: (paginateArgs) =>
      db.schedule.findMany({
        ...paginateArgs,
        where,
        orderBy,
      }),
  })

  return {
    schedules,
    hasMore,
    count,
  }
}

export default getSchedules
