import { AuthenticationError, Ctx } from "blitz"
import db, { InterviewerJobWorkflowStage, Prisma } from "db"
import { Job } from "app/jobs/validations"
import slugify from "slugify"
import Guard from "app/guard/ability"
import { ExtendedJob } from "types"
import { findFreeSlug } from "app/core/utils/findFreeSlug"

type AssignInterviewerInputProps = {
  jobId: string
  workflowStageId: string
  interviewerId: number
}

async function assignInterviewerToJobStage(
  { jobId, workflowStageId, interviewerId }: AssignInterviewerInputProps,
  ctx: Ctx
) {
  ctx.session.$authorize()

  const existingInterviewer = await db.interviewerJobWorkflowStage.findFirst({
    where: { jobId, workflowStageId },
  })

  if (existingInterviewer) {
    // update
    const updatedInterviewer = await db.interviewerJobWorkflowStage.update({
      where: { id: existingInterviewer.id },
      data: { interviewerId },
    })

    return updatedInterviewer
  } else {
    // create
    const createdInterviewer = await db.interviewerJobWorkflowStage.create({
      data: { jobId, workflowStageId, interviewerId },
    })
    return createdInterviewer
  }
}

export default Guard.authorize("update", "job", assignInterviewerToJobStage)
