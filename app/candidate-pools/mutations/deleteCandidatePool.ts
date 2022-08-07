import { Ctx } from "blitz"
import db, { Prisma } from "db"
import Guard from "app/guard/ability"

type DeleteCandidatePoolInput = Pick<Prisma.CandidatePoolDeleteArgs, "where">

async function deleteCandidatePool({ where }: DeleteCandidatePoolInput, ctx: Ctx) {
  ctx.session.$authorize()

  const candidatePool = await db.candidatePool.delete({ where })

  return candidatePool
}

export default Guard.authorize("read", "candidatePool", deleteCandidatePool)
