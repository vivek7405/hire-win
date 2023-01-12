import { AuthenticationError, Ctx } from "blitz"
import db, { CandidateActivityType, Prisma, User } from "db"
import { Candidate } from "src/candidates/validations"
import slugify from "slugify"
import Guard from "src/guard/ability"
import { ExtendedCandidate } from "types"
import { findFreeSlug } from "src/core/utils/findFreeSlug"

type UpdateCandidateInput = Pick<Prisma.CandidateUpdateArgs, "where"> & {
  visibleOnlyToParentMembers: boolean
}

async function setCandidateVisibleParent(
  { where, visibleOnlyToParentMembers }: UpdateCandidateInput,
  ctx: Ctx
) {
  ctx.session.$authorize()

  const user = await db.user.findFirst({ where: { id: ctx.session.userId! } })
  if (!user) throw new AuthenticationError()

  const candidate = await db.candidate.update({
    where,
    data: {
      visibleOnlyToParentMembers,
    },
    select: { id: true, stage: true },
  })

  return candidate
}

export default setCandidateVisibleParent
