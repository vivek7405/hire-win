import db from "db"
import { resolver } from "blitz"
import * as z from "zod"

export default resolver.pipe(
  resolver.zod(z.object({ jobId: z.string(), workflowStageId: z.string(), userId: z.number() })),
  async ({ jobId, workflowStageId, userId }) => {
    const scheduleInterview = await db.jobUserScheduleCalendar.findUnique({
      where: {
        jobId_workflowStageId_userId: {
          jobId,
          workflowStageId,
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
