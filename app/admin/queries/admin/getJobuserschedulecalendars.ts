import { paginate, Ctx } from "blitz"
import db, { Prisma } from "db"

interface GetJobuserschedulecalendarsInput
  extends Pick<Prisma.JobUserScheduleCalendarFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

async function getJobuserschedulecalendars(
  { where, orderBy, skip = 0, take = 100 }: GetJobuserschedulecalendarsInput,
  ctx: Ctx
) {
  ctx.session.$authorize("ADMIN")

  const {
    items: jobuserschedulecalendars,
    hasMore,
    count,
  } = await paginate({
    skip,
    take,
    count: () => db.jobUserScheduleCalendar.count({ where }),
    query: (paginateArgs) =>
      db.jobUserScheduleCalendar.findMany({
        ...paginateArgs,
        where,
        orderBy,
      }),
  })

  return {
    jobuserschedulecalendars,
    hasMore,
    count,
  }
}

export default getJobuserschedulecalendars
