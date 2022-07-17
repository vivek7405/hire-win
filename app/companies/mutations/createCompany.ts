import { resolver, Ctx } from "blitz"
import db, { CompanyUserRole } from "db"
import slugify from "slugify"
import { findFreeSlug } from "app/core/utils/findFreeSlug"
import { CompanyObj } from "../validations"
import provideTrail from "app/core/utils/provideTrial"
import Guard from "app/guard/ability"
import createFactoryItems from "app/core/utils/createFactoryItems"

export default Guard.authorize(
  "create",
  "company",
  resolver.pipe(
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

      await createFactoryItems(companyId)

      await ctx.session.$setPublicData({ companyId: company.id || "0" })

      // await provideTrail(ctx?.session?.userId || "0", company.id || "0")

      return company
    }
  )
)
