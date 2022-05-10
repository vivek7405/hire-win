import db from "db"
import { resolver } from "blitz"
import * as z from "zod"

export default resolver.pipe(resolver.zod(z.number()), resolver.authorize(), async (scheduleId) => {
  const interviewsDependingOnSchedule = await db.interviewDetail.count({
    where: { scheduleId: scheduleId },
  })

  if (interviewsDependingOnSchedule > 0) {
    return "error"
  }

  await db.dailySchedule.deleteMany({
    where: { scheduleId: scheduleId },
  })
  await db.schedule.delete({
    where: { id: scheduleId },
  })

  return "success"
})
