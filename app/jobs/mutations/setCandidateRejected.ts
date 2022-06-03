import { AuthenticationError, Ctx } from "blitz"
import db, { Prisma } from "db"
import { Candidate } from "app/jobs/validations"
import slugify from "slugify"
import Guard from "app/guard/ability"
import { ExtendedCandidate } from "types"
import { findFreeSlug } from "app/core/utils/findFreeSlug"

type UpdateCandidateInput = Pick<Prisma.CandidateUpdateArgs, "where"> & {
  rejected: boolean
}

async function setCandidateRejected({ where, rejected }: UpdateCandidateInput, ctx: Ctx) {
  ctx.session.$authorize()

  const user = await db.user.findFirst({ where: { id: ctx.session.userId! } })
  if (!user) throw new AuthenticationError()

  const candidate = await db.candidate.update({
    where,
    data: {
      rejected,
    },
  })

  return candidate
}

export default Guard.authorize("update", "candidate", setCandidateRejected)
