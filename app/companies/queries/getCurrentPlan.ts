import { checkPlan } from "app/users/utils/checkPlan"
import { Ctx } from "blitz"
import db from "db"

export default async function getCurrentPlan(_ = null, ctx: Ctx) {
  ctx.session.$authorize()

  const companyUser = await db.companyUser.findFirst({
    where: { companyId: ctx.session.companyId || "0", userId: ctx.session.userId || "0" },
    include: { company: true },
  })

  if (!companyUser) return null

  const currentPlan = checkPlan(companyUser.company)

  return currentPlan
}
