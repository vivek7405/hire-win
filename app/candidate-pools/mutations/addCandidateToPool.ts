import { Ctx } from "blitz"
import db from "db"

export default async function addCandidateToPool({ candidateId, poolId }, ctx: Ctx) {
  ctx.session.$authorize()

  const updatedCandidate = await db.candidate.update({
    where: { id: candidateId },
    data: {
      candidatePools: {
        connect: {
          id: poolId,
        },
      },
    },
  })

  return updatedCandidate
}
