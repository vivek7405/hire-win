import { AuthenticationError, Ctx } from "blitz"
import db from "db"
import { Job } from "app/jobs/validations"
import slugify from "slugify"
import Guard from "app/guard/ability"
import { ExtendedJob } from "types"
import { findFreeSlug } from "app/core/utils/findFreeSlug"
import { customTsParser } from "@blitzjs/installer"

type ScheduleCalendarInputProps = {
  stageId: string
  scheduleId: string
}

async function assignScheduleToJobStage(
  { stageId, scheduleId }: ScheduleCalendarInputProps,
  ctx: Ctx
) {
  ctx.session.$authorize()

  const user = await db.user.findFirst({
    where: { id: ctx.session.userId },
    include: { defaultCalendars: true, defaultSchedules: true, schedules: true },
  })

  const existingScheduleCalendar = await db.stageUserScheduleCalendar.findUnique({
    where: {
      stageId_userId: {
        stageId,
        userId: user?.id || "0",
      },
    },
  })

  if (existingScheduleCalendar) {
    // update
    const updatedScheduleCalendar = await db.stageUserScheduleCalendar.update({
      where: { id: existingScheduleCalendar.id },
      data: { scheduleId },
    })

    return updatedScheduleCalendar
  } else {
    const schId =
      user?.schedules?.find((sch) => sch.userId === user?.id && sch.id === scheduleId)?.id || null
    const defaultScheduleId =
      user?.defaultSchedules.find((sch) => sch.userId === user.id)?.scheduleId || "0"
    const defaultCalendarId =
      user?.defaultCalendars.find((cal) => cal.userId === user.id)?.calendarId || null

    // create
    if (stageId && defaultCalendarId && (schId || defaultScheduleId)) {
      const createdScheduleCalendar = await db.stageUserScheduleCalendar.create({
        data: {
          stageId,
          userId: user?.id || "0",
          scheduleId: schId || defaultScheduleId || "0",
          calendarId: defaultCalendarId,
        },
      })
      return createdScheduleCalendar
    }
  }

  return null
}

export default assignScheduleToJobStage
