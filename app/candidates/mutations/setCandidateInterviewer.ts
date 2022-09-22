import { AuthenticationError, Ctx } from "blitz"
import db, { Prisma } from "db"
import { Candidate } from "app/candidates/validations"
import slugify from "slugify"
import Guard from "app/guard/ability"
import { ExtendedCandidate } from "types"
import { findFreeSlug } from "app/core/utils/findFreeSlug"

type UpdateCandidateWorkflowStageInterviewerInput = {
  candidateId: string
  stageId: string
  interviewerId: string
}

async function setCandidateInterviewer(
  { candidateId, stageId, interviewerId }: UpdateCandidateWorkflowStageInterviewerInput,
  ctx: Ctx
) {
  ctx.session.$authorize()

  const candidate = await db.stage.update({
    where: { id: stageId || "0" },
    data: { interviewerId },
  })

  return candidate
}

export default setCandidateInterviewer
