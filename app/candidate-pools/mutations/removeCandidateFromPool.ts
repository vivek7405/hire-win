import { Ctx } from "blitz"
import db from "db"

export default async function removeCandidateFromPool(
  { candidateId, candidatePoolSlug },
  ctx: Ctx
) {
  const updatedCandidatePool = await db.candidatePool.update({
    where: { slug: candidatePoolSlug },
    data: {
      candidates: {
        disconnect: {
          id: candidateId,
        },
      },
    },
  })

  return updatedCandidatePool
}
