import { Ctx } from "blitz"
import db, { Prisma } from "db"
import { Candidate } from "app/jobs/validations"
import Guard from "app/guard/ability"
import { ExtendedCandidate } from "types"

type UpdateCandidateStageInput = Pick<Prisma.CandidateUpdateArgs, "where"> & {
  data: { workflowStageId: string }
}

async function updateCandidateStage({ where, data }: UpdateCandidateStageInput, ctx: Ctx) {
  ctx.session.$authorize()

  const { workflowStageId } = data

  const candidate = await db.candidate.update({
    where,
    data: {
      workflowStageId,
    },
  })

  return candidate
}

export default Guard.authorize("update", "candidate", updateCandidateStage)
