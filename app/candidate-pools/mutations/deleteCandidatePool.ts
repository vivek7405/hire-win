import { Ctx } from "blitz"
import db, { Prisma } from "db"
import Guard from "app/guard/ability"

type DeleteCandidatePoolInput = Pick<Prisma.CandidatePoolDeleteArgs, "where">

async function deleteCandidatePool(candidatePoolId, ctx: Ctx) {
  ctx.session.$authorize()

  const candidatePool = await db.candidatePool.delete({
    where: { id: candidatePoolId },
  })

  return candidatePool
}

export default Guard.authorize("read", "candidatePool", deleteCandidatePool)
