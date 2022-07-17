import { AuthenticationError, Ctx } from "blitz"
import db, { InterviewDetail, Prisma } from "db"
import { Job } from "app/jobs/validations"
import slugify from "slugify"
import Guard from "app/guard/ability"
import { ExtendedJob } from "types"
import { findFreeSlug } from "app/core/utils/findFreeSlug"
import { customTsParser } from "@blitzjs/installer"

type InterviewDetailInputProps = {
  jobId: string
  workflowStageId: string
  calendarId: string
}

async function assignCalendarToJobStage(
  { jobId, workflowStageId, calendarId }: InterviewDetailInputProps,
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
        userId: user?.id || "0",
      },
    },
  })

  if (existingScheduleCalendar) {
    // update
    const updatedScheduleCalendar = await db.jobUserScheduleCalendar.update({
      where: { id: existingScheduleCalendar.id },
      data: { calendarId },
    })

    return updatedScheduleCalendar
  } else {
    const defaultScheduleId = user?.schedules.find((sch) => sch.name === "Default")?.id || "0"
    const calId =
      user?.calendars?.find((cal) => cal.userId === user.id && cal.id === calendarId)?.id || null
    const defaultCalendarId =
      user?.defaultCalendars?.find((cal) => cal.userId === user.id)?.calendarId || null

    // create
    if (jobId && workflowStageId && defaultScheduleId && (calId || defaultCalendarId)) {
      const createdScheduleCalendar = await db.jobUserScheduleCalendar.create({
        data: {
          jobId,
          workflowStageId,
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
