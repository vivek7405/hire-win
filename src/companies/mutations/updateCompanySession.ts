import { resolver } from "@blitzjs/rpc";
import { Ctx } from "blitz";
import db, { CompanyUserRole } from "db"
import slugify from "slugify"
import { findFreeSlug } from "src/core/utils/findFreeSlug"
import { CompanyObj } from "../validations"

export default async function updateCompanySession(companyId: string, ctx: Ctx) {
  await ctx.session.$setPublicData({ companyId: companyId || "0" })
}
