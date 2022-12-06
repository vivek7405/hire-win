import { resolver } from "@blitzjs/rpc";
import db from "db"
import { Ctx } from "blitz";
import * as z from "zod"

export default resolver.pipe(
  resolver.zod(z.string()),
  resolver.authorize(),
  async (scheduleId, ctx: Ctx) => {
    const scheduleCalendar = await db.stageUserScheduleCalendar.count({
      where: { scheduleId },
    })
    if (scheduleCalendar > 0) {
      throw new Error("Can't delete, schedule is being used.")
    }

    const defaultSchedule = await db.defaultSchedule.findFirst({
      where: { userId: ctx?.session?.userId || "0" },
    })
    if (defaultSchedule?.scheduleId === scheduleId) {
      throw new Error("You cannot delete the default Schedule.")
    }

    await db.dailySchedule.deleteMany({
      where: { scheduleId },
    })
    await db.schedule.delete({
      where: { id: scheduleId },
    })

    return true
  }
)
