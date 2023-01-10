import { Ctx } from "blitz"
import Guard from "src/guard/ability"
import db from "db"

interface InviteToParentCompanyInput {
  parentCompanyId: string
  autoAddUsersToCompanies: boolean
}

async function updateAutoAddMembers(
  { parentCompanyId, autoAddUsersToCompanies }: InviteToParentCompanyInput,
  ctx: Ctx
) {
  ctx.session.$authorize()

  const updatedParentCompany = await db.parentCompany.update({
    where: { id: parentCompanyId || "0" },
    data: { autoAddUsersToCompanies },
  })

  return updatedParentCompany
}

export default updateAutoAddMembers
