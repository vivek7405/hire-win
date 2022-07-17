import { Ctx } from "blitz"
import db from "db"

export default async function removeCandidateFromPool(
  { candidateId, candidatePoolSlug },
  ctx: Ctx
) {
  const updatedCandidatePool = await db.candidatePool.update({
    where: {
      companyId_slug: {
        companyId: ctx.session.companyId || "0",
        slug: candidatePoolSlug,
      },
    },
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
