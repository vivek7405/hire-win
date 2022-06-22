import { AuthenticationError, Ctx } from "blitz"
import db, { InterviewDetail, Prisma } from "db"
import { Job } from "app/jobs/validations"
import slugify from "slugify"
import Guard from "app/guard/ability"
import { ExtendedJob } from "types"
import { findFreeSlug } from "app/core/utils/findFreeSlug"
import { customTsParser } from "@blitzjs/installer"

type ScheduleCalendarInputProps = {
  jobId: string
  workflowStageId: string
  scheduleId: number
}

async function assignScheduleToJobStage(
  { jobId, workflowStageId, scheduleId }: ScheduleCalendarInputProps,
  ctx: Ctx
) {
  ctx.session.$authorize()

  const user = await db.user.findFirst({
    where: { id: ctx.session.userId },
    include: { defaultCalendars: true, schedules: true, calendars: true },
  })

  const existingScheduleCalendar = await db.jobUserScheduleCalendar.findUnique({
    where: {
      jobId_workflowStageId_userId: {
        jobId,
        workflowStageId,
        userId: user?.id || 0,
      },
    },
  })

  if (existingScheduleCalendar) {
    // update
    const updatedScheduleCalendar = await db.jobUserScheduleCalendar.update({
      where: { id: existingScheduleCalendar.id },
      data: { scheduleId },
    })

    return updatedScheduleCalendar
  } else {
    const schId =
      user?.schedules?.find((sch) => sch.ownerId === user?.id && sch.id === scheduleId)?.id || null
    const defaultScheduleId =
      user?.schedules?.find((sch) => sch.factory && sch.name === "Default")?.id || 0
    const defaultCalendarId =
      user?.defaultCalendars.find((cal) => cal.userId === user.id)?.calendarId || null

    // create
    if (jobId && workflowStageId && defaultCalendarId && (schId || defaultScheduleId)) {
      const createdScheduleCalendar = await db.jobUserScheduleCalendar.create({
        data: {
          jobId,
          workflowStageId,
          userId: user?.id || 0,
          scheduleId: schId || defaultScheduleId,
          calendarId: defaultCalendarId,
        },
      })
      return createdScheduleCalendar
    }
  }

  return null
}

export default assignScheduleToJobStage
