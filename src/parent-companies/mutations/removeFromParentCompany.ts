import { Ctx } from "blitz"
import Guard from "src/guard/ability"
import db from "db"

interface InviteToParentCompanyInput {
  parentCompanyId: string
  userId: string
}

async function removeFromParentCompany(
  { parentCompanyId, userId }: InviteToParentCompanyInput,
  ctx: Ctx
) {
  ctx.session.$authorize()

  const parentCompanyUser = await db.parentCompanyUser.findFirst({
    where: { parentCompanyId, userId },
    include: { parentCompany: true },
  })

  if (parentCompanyUser) {
    await db.parentCompanyUser.delete({
      where: {
        id: parentCompanyUser?.id,
      },
    })
  }
}

export default Guard.authorize("access", "parentCompanySettings", removeFromParentCompany)
