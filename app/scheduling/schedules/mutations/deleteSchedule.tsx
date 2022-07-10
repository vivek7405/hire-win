import db from "db"
import { resolver } from "blitz"
import * as z from "zod"

export default resolver.pipe(resolver.zod(z.number()), resolver.authorize(), async (scheduleId) => {
  const scheduleCalendar = await db.jobUserScheduleCalendar.count({
    where: { scheduleId },
  })

  if (scheduleCalendar > 0) {
    throw new Error("Can't delete, schedule is being used.")
  }

  await db.dailySchedule.deleteMany({
    where: { scheduleId },
  })
  await db.schedule.delete({
    where: { id: scheduleId },
  })

  return true
})
