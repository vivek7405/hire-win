import db from "db"
import { resolver } from "blitz"
import * as z from "zod"
import { ScheduleInput } from "../validations"
import slugify from "slugify"

export default resolver.pipe(
  resolver.zod(ScheduleInput),
  resolver.authorize(),
  async (scheduleCreate, ctx) => {
    const slug = slugify(scheduleCreate.name, { strict: true, lower: true })
    const schedule = await db.schedule.create({
      data: {
        name: scheduleCreate.name,
        slug,
        timezone: scheduleCreate.timezone!,
        user: {
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
      },
    })

    return schedule
  }
)
