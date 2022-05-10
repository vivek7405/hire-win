import { paginate, Ctx } from "blitz"
import db, { Prisma } from "db"

interface GetCalendarsInput
  extends Pick<Prisma.CalendarFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

async function getCalendars({ where, orderBy, skip = 0, take = 100 }: GetCalendarsInput, ctx: Ctx) {
  ctx.session.$authorize("ADMIN")

  const {
    items: calendars,
    hasMore,
    count,
  } = await paginate({
    skip,
    take,
    count: () => db.calendar.count({ where }),
    query: (paginateArgs) =>
      db.calendar.findMany({
        ...paginateArgs,
        where,
        orderBy,
      }),
  })

  return {
    calendars,
    hasMore,
    count,
  }
}

export default getCalendars
