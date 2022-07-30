import { Ctx } from "blitz"
import db, { Prisma } from "db"

type UpdateCandidatepoolInput = Pick<Prisma.CandidatePoolUpdateArgs, "where" | "data">

async function updateCandidatepool({ where, data }: UpdateCandidatepoolInput, ctx: Ctx) {
  ctx.session.$authorize("ADMIN")

  const candidatepool = await db.candidatePool.update({
    where,
    data,
  })

  return candidatepool
}

export default updateCandidatepool
