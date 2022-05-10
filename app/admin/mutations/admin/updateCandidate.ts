import { Ctx } from "blitz"
import db, { Prisma } from "db"

type UpdateCandidateInput = Pick<Prisma.CandidateUpdateArgs, "where" | "data">

async function updateCandidate({ where, data }: UpdateCandidateInput, ctx: Ctx) {
  ctx.session.$authorize("ADMIN")

  const candidate = await db.candidate.update({
    where,
    data,
  })

  return candidate
}

export default updateCandidate
