import { Ctx } from "blitz";
import db, { Prisma } from "db"
import { Job } from "src/jobs/validations"
import slugify from "slugify"
import Guard from "src/guard/ability"
import { ExtendedJob } from "types"
import { findFreeSlug } from "src/core/utils/findFreeSlug"
import { customTsParser } from "@blitzjs/installer"

type InterviewDetailInputProps = {
  stageId: string
  calendarId: string
}

async function assignCalendarToJobStage(
  { stageId, calendarId }: InterviewDetailInputProps,
  ctx: Ctx
) {
  ctx.session.$authorize()

  const user = await db.user.findFirst({
    where: { id: ctx.session.userId },
    include: { defaultCalendars: true, defaultSchedules: true, calendars: true },
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
      data: { calendarId },
    })

    return updatedScheduleCalendar
  } else {
    const defaultScheduleId =
      user?.defaultSchedules?.find((sch) => sch.userId === user.id)?.scheduleId || "0"
    const calId =
      user?.calendars?.find((cal) => cal.userId === user.id && cal.id === calendarId)?.id || null
    const defaultCalendarId =
      user?.defaultCalendars?.find((cal) => cal.userId === user.id)?.calendarId || null

    // create
    if (stageId && defaultScheduleId && (calId || defaultCalendarId)) {
      const createdScheduleCalendar = await db.stageUserScheduleCalendar.create({
        data: {
          stageId,
          userId: ctx.session.userId,
          scheduleId: defaultScheduleId,
          calendarId: calId || defaultCalendarId,
        },
      })
      return createdScheduleCalendar
    }
  }

  return null
}

export default assignCalendarToJobStage
