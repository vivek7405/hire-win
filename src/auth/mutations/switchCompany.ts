import { Ctx } from "blitz"
import db from "db"

type SwitchCompanyInput = {
  companyId: string
}
export default async function switchCompany({ companyId }: SwitchCompanyInput, ctx: Ctx) {
  const companyUser = await db.companyUser.findFirst({
    where: {
      companyId,
      userId: ctx?.session?.userId || "0",
    },
  })

  if (!companyUser) {
    // throw new Error({ statusCode: 403, title: "You don't have the permission to access." })
    throw new Error("You don't have the access.")
  }

  return await ctx.session.$setPublicData({ companyId })
}
