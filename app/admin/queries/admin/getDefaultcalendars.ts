import { paginate, Ctx } from "blitz"
import db, { Prisma } from "db"

interface GetDefaultcalendarsInput
  extends Pick<Prisma.DefaultCalendarFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

async function getDefaultcalendars(
  { where, orderBy, skip = 0, take = 100 }: GetDefaultcalendarsInput,
  ctx: Ctx
) {
  ctx.session.$authorize("ADMIN")

  const {
    items: defaultcalendars,
    hasMore,
    count,
  } = await paginate({
    skip,
    take,
    count: () => db.defaultCalendar.count({ where }),
    query: (paginateArgs) =>
      db.defaultCalendar.findMany({
        ...paginateArgs,
        where,
        orderBy,
      }),
  })

  return {
    defaultcalendars,
    hasMore,
    count,
  }
}

export default getDefaultcalendars
