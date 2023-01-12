import { Ctx } from "blitz"
import db, { CandidateActivityType, User } from "db"

export default async function removeCandidateFromPool({ candidateId, poolId }, ctx: Ctx) {
  const updatedCandidatePool = await db.candidatePool.update({
    where: { id: poolId },
    data: {
      candidates: {
        disconnect: {
          id: candidateId,
        },
      },
    },
  })

  let loggedInUser: User | null = null
  if (ctx?.session?.userId) {
    loggedInUser = await db.user.findFirst({ where: { id: ctx?.session?.userId } })
  }

  const candidatePool = await db.candidatePool.findUnique({
    where: { id: poolId },
  })

  const candidate = await db.candidate.findUnique({
    where: { id: candidateId },
    include: { stage: true },
  })

  await db.candidateActivity.create({
    data: {
      title: `Candidate removed from pool "${candidatePool?.name}" by ${loggedInUser?.name} while in stage "${candidate?.stage?.name}"`,
      type: CandidateActivityType.Removed_From_Pool,
      performedByUserId: ctx?.session?.userId || "0",
      candidateId: candidate?.id || "0",
    },
  })

  return updatedCandidatePool
}
