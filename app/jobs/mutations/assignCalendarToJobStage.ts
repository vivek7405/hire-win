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
  calendarId: number
}

async function assignCalendarToJobStage(
  { jobId, workflowStageId, calendarId }: InterviewDetailInputProps,
  ctx: Ctx
) {
  ctx.session.$authorize()

  const user = await db.user.findFirst({
    where: { id: ctx.session.userId },
    include: { defaultCalendars: true, schedules: true },
  })

  const existingInterviewDetail = await db.interviewDetail.findFirst({
    where: { jobId, workflowStageId },
  })

  if (existingInterviewDetail) {
    // update
    const updatedInterviewDetail = await db.interviewDetail.update({
      where: { id: existingInterviewDetail.id },
      data: { calendarId },
    })

    return updatedInterviewDetail
  } else {
    const scheduleId = user?.schedules.find((sch) => sch.name === "Default")?.id || 0
    const calendarId =
      user?.defaultCalendars.find((cal) => cal.userId === user.id)?.calendarId || null
    const duration = 30

    // create
    if (jobId && workflowStageId && scheduleId && calendarId) {
      const createdInterviewDetail = await db.interviewDetail.create({
        data: {
          jobId,
          workflowStageId,
          interviewerId: ctx.session.userId,
          scheduleId,
          calendarId,
          duration,
        },
      })
      return createdInterviewDetail
    }
  }

  return null
}

export default assignCalendarToJobStage
