import { resolver } from "@blitzjs/rpc";
import db from "db"
import * as z from "zod"
import { ScheduleInput } from "../validations"

export default resolver.pipe(
  resolver.zod(ScheduleInput),
  resolver.authorize(),
  async (scheduleUpdate, ctx) => {
    // const dailySchedules = Object.entries(scheduleUpdate.schedule).map(
    //   ([day, { blocked, startTime, endTime }]) => ({
    //     day,
    //     startTime: blocked ? "00:00" : startTime,
    //     endTime: blocked ? "00:00" : endTime,
    //   })
    // )
    const schedule = await db.schedule.update({
      where: { id: scheduleUpdate.id },
      data: {
        name: scheduleUpdate.name,
        timezone: scheduleUpdate.timezone!,
        dailySchedules: {
          upsert: Object.entries(scheduleUpdate.schedule).map(
            ([day, { blocked, startTime, endTime }]) => {
              return {
                where: {
                  scheduleId_day: {
                    scheduleId: scheduleUpdate.id!,
                    day: day,
                  },
                },
                create: {
                  day: day,
                  startTime: blocked ? "00:00" : startTime,
                  endTime: blocked ? "00:00" : endTime,
                },
                update: {
                  startTime: blocked ? "00:00" : startTime,
                  endTime: blocked ? "00:00" : endTime,
                },
              }
            }
          ),
        },
      },
    })

    return schedule
  }
)
