import db from "db"
import { resolver } from "blitz"
import * as z from "zod"

export default resolver.pipe(
  resolver.zod(z.object({ stageId: z.string(), userId: z.string() })),
  async ({ stageId, userId }) => {
    const scheduleInterview = await db.stageUserScheduleCalendar.findUnique({
      where: {
        stageId_userId: {
          stageId,
          userId,
        },
      },
      include: {
        schedule: { include: { dailySchedules: true } },
        calendar: true,
      },
    })

    return scheduleInterview
  }
)
