import { resolver } from "@blitzjs/rpc";
import { Ctx } from "blitz";
import db, { CompanyUserRole } from "db"
import slugify from "slugify"
import { findFreeSlug } from "src/core/utils/findFreeSlug"
import { CompanyObj } from "../validations"
import provideTrail from "src/core/utils/provideTrial"
import Guard from "src/guard/ability"
import createFactoryItems from "src/auth/mutations/createFactoryItems"

export default resolver.pipe(
  resolver.zod(CompanyObj),
  async ({ name, logo, website, theme, info }, ctx: Ctx) => {
    const slug = slugify(name, { strict: true, lower: true })
    const newSlug = await findFreeSlug(
      slug,
      async (e) => await db.company.findFirst({ where: { slug: e } })
    )

    let data = {
      name,
      info,
      website,
      theme,
      slug: newSlug,
    }

    if (logo) {
      data["logo"] = logo
    }

    const company = await db.company.create({
      data: {
        ...data,
        users: {
          create: {
            userId: ctx?.session?.userId || "0",
            role: CompanyUserRole.OWNER,
          },
        },
      },
    })

    const companyId = company?.id || "0"

    await ctx.session.$setPublicData({ companyId: company.id || "0" })

    await createFactoryItems({ companyId }, ctx)

    // await provideTrail(ctx?.session?.userId || "0", company.id || "0")

    return company
  }
)
