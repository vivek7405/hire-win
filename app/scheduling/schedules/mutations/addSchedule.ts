import db from "db"
import { resolver } from "blitz"
import * as z from "zod"
import { ScheduleInput } from "../validations"

export default resolver.pipe(
  resolver.zod(ScheduleInput),
  resolver.authorize(),
  async (scheduleCreate, ctx) => {
    const schedule = await db.schedule.create({
      data: {
        name: scheduleCreate.name,
        timezone: scheduleCreate.timezone!,
        owner: {
          connect: { id: ctx.session.userId },
        },
        dailySchedules: {
          create: Object.entries(scheduleCreate.schedule).map(
            ([day, { blocked, startTime, endTime }]) => ({
              day,
              startTime: blocked ? "00:00" : startTime,
              endTime: blocked ? "00:00" : endTime,
            })
          ),
        },
        factory: scheduleCreate.factory || false,
      },
    })

    return schedule
  }
)
