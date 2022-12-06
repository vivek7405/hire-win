import { Ctx } from "blitz"
import db, { CandidateActivityType, User } from "db"

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
    include: { stage: true },
  })

  let loggedInUser: User | null = null
  if (ctx?.session?.userId) {
    loggedInUser = await db.user.findFirst({ where: { id: ctx?.session?.userId } })
  }

  const candidatePool = await db.candidatePool.findUnique({
    where: { id: poolId },
  })

  await db.candidateActivity.create({
    data: {
      title: `Candidate added to pool "${candidatePool?.name}" by ${loggedInUser?.name} while in stage "${updatedCandidate?.stage?.name}"`,
      type: CandidateActivityType.Added_To_Pool,
      performedByUserId: ctx?.session?.userId || "0",
      candidateId: updatedCandidate?.id || "0",
    },
  })

  return updatedCandidate
}
