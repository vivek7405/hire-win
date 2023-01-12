import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db, { CompanyUserRole } from "db"
import slugify from "slugify"
import { findFreeSlug } from "src/core/utils/findFreeSlug"
import { CompanyObj } from "../validations"

export default async function updateCompanySession(companyId: string, ctx: Ctx) {
  const companyUser = await db.companyUser.findFirst({
    where: {
      companyId,
      userId: ctx?.session?.userId || "0",
    },
  })

  if (!companyUser) {
    throw new Error("You don't have the access.")
  }

  await ctx.session.$setPublicData({ companyId })
  // await ctx.session.$setPublicData({ companyId: companyId || "0" })
}
