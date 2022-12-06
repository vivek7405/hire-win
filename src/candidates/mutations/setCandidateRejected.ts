import { AuthenticationError, Ctx } from "blitz"
import db, { CandidateActivityType, Prisma, User } from "db"
import { Candidate } from "src/candidates/validations"
import slugify from "slugify"
import Guard from "src/guard/ability"
import { ExtendedCandidate } from "types"
import { findFreeSlug } from "src/core/utils/findFreeSlug"

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
    select: { id: true, stage: true },
  })

  let loggedInUser: User | null = null
  if (ctx?.session?.userId) {
    loggedInUser = await db.user.findFirst({ where: { id: ctx?.session?.userId } })
  }

  await db.candidateActivity.create({
    data: {
      title: `Candidate ${rejected ? "rejected" : "restored"} in stage "${
        candidate?.stage?.name
      }" by ${loggedInUser?.name}`,
      type: rejected
        ? CandidateActivityType.Candidate_Rejected
        : CandidateActivityType.Candidate_Restored,
      performedByUserId: ctx?.session?.userId || "0",
      candidateId: candidate?.id || "0",
    },
  })

  return candidate
}

export default Guard.authorize("update", "candidate", setCandidateRejected)
