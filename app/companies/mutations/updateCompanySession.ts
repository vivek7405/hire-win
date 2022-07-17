import { resolver, Ctx } from "blitz"
import db, { CompanyUserRole } from "db"
import slugify from "slugify"
import { findFreeSlug } from "app/core/utils/findFreeSlug"
import { CompanyObj } from "../validations"

export default async function updateCompanySession(companyId: string, ctx: Ctx) {
  await ctx.session.$setPublicData({ companyId: companyId || "0" })
}
