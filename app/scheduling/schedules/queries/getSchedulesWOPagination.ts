import Guard from "app/guard/ability"
import { resolver } from "blitz"
import db, { Prisma } from "db"

interface GetSchedulesInput extends Pick<Prisma.ScheduleFindManyArgs, "where"> {}

const getSchedulesWOPagination = resolver.pipe(
  resolver.authorize(),
  async ({ where }: GetSchedulesInput) => {
    const schedules = await db.schedule.findMany({
      where,
      include: { dailySchedules: true },
    })
    return schedules
  }
)

export default Guard.authorize("readAll", "schedule", getSchedulesWOPagination)
