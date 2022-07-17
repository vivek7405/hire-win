import { AuthenticationError, Ctx } from "blitz"
import db, { Prisma } from "db"
import { Candidate } from "app/candidates/validations"
import slugify from "slugify"
import Guard from "app/guard/ability"
import { ExtendedCandidate } from "types"
import { findFreeSlug } from "app/core/utils/findFreeSlug"

type UpdateCandidateWorkflowStageInterviewerInput = {
  candidateId: string
  workflowStageId: string
  interviewerId: string
}

async function setCandidateInterviewer(
  { candidateId, workflowStageId, interviewerId }: UpdateCandidateWorkflowStageInterviewerInput,
  ctx: Ctx
) {
  ctx.session.$authorize()

  const candidate = await db.candidateWorkflowStageInterviewer.upsert({
    where: {
      candidateId_workflowStageId: {
        candidateId,
        workflowStageId,
      },
    },
    create: {
      candidateId,
      workflowStageId,
      interviewerId,
    },
    update: {
      interviewerId,
    },
  })

  return candidate
}

export default setCandidateInterviewer
