import { AuthenticationError, Ctx } from "blitz"
import db, { InterviewDetail, Prisma } from "db"
import { Job } from "app/jobs/validations"
import slugify from "slugify"
import Guard from "app/guard/ability"
import { ExtendedJob } from "types"
import { findFreeSlug } from "app/core/utils/findFreeSlug"

type InterviewDetailInputProps = {
  jobId: string
  workflowStageId: string
  interviewerId: number
}

async function assignInterviewerToJobStage(
  { jobId, workflowStageId, interviewerId }: InterviewDetailInputProps,
  ctx: Ctx
) {
  ctx.session.$authorize()

  const interviewer = await db.user.findFirst({
    where: { id: interviewerId },
    include: { defaultCalendars: true, schedules: true },
  })

  if (interviewer) {
    const existingInterviewDetail = await db.interviewDetail.findUnique({
      where: {
        jobId_workflowStageId: {
          jobId,
          workflowStageId,
        },
      },
    })

    const scheduleId = interviewer.schedules.find((sch) => sch.name === "Default")?.id || 0
    const calendarId =
      interviewer.defaultCalendars.find((cal) => cal.userId === interviewerId)?.calendarId || null

    if (existingInterviewDetail) {
      // update
      const updatedInterviewDetail = await db.interviewDetail.update({
        where: { id: existingInterviewDetail.id },
        data: { interviewerId, scheduleId, calendarId }, // assign default schedule and default calendar when an interviewer is updated
      })

      return updatedInterviewDetail
    } else {
      const duration = 30

      // create
      if (jobId && workflowStageId && interviewerId && scheduleId && calendarId) {
        const createdInterviewDetail = await db.interviewDetail.create({
          data: { jobId, workflowStageId, interviewerId, scheduleId, calendarId, duration },
        })
        return createdInterviewDetail
      }
    }

    return null
  }
}

export default Guard.authorize("update", "job", assignInterviewerToJobStage)
