import { Ctx } from "blitz"
import Guard from "src/guard/ability"
import db from "db"

interface InviteToParentCompanyInput {
  parentCompanyId: string
  newCandidatesVisibleOnlyToParentMembers: boolean
}

async function updateNewCandidatesVisibility(
  { parentCompanyId, newCandidatesVisibleOnlyToParentMembers }: InviteToParentCompanyInput,
  ctx: Ctx
) {
  ctx.session.$authorize()

  const updatedParentCompany = await db.parentCompany.update({
    where: { id: parentCompanyId || "0" },
    data: { newCandidatesVisibleOnlyToParentMembers },
  })

  return updatedParentCompany
}

export default updateNewCandidatesVisibility
