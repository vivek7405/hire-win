import { Ctx } from "blitz"
import db, { Prisma } from "db"

type UpdateCandidateworkflowstageinterviewerInput = Pick<
  Prisma.CandidateWorkflowStageInterviewerUpdateArgs,
  "where" | "data"
>

async function updateCandidateworkflowstageinterviewer(
  { where, data }: UpdateCandidateworkflowstageinterviewerInput,
  ctx: Ctx
) {
  ctx.session.$authorize("ADMIN")

  const candidateworkflowstageinterviewer = await db.candidateWorkflowStageInterviewer.update({
    where,
    data,
  })

  return candidateworkflowstageinterviewer
}

export default updateCandidateworkflowstageinterviewer
