import { Ctx } from "blitz"
import db from "db"
import Guard from "app/guard/ability"

type InterviewDetailInputProps = {
  jobId: string
  workflowStageId: string
  interviewerId: string
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

    if (existingInterviewDetail) {
      // update
      const updatedInterviewDetail = await db.interviewDetail.update({
        where: { id: existingInterviewDetail.id },
        data: { interviewerId },
      })

      return updatedInterviewDetail
    } else {
      const duration = 30

      // create
      if (jobId && workflowStageId && interviewerId) {
        const createdInterviewDetail = await db.interviewDetail.create({
          data: { jobId, workflowStageId, interviewerId, duration },
        })
        return createdInterviewDetail
      }
    }

    return null
  }
}

export default assignInterviewerToJobStage
