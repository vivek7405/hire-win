import { resolver, Ctx } from "blitz"
import db, { CompanyUserRole } from "db"
import slugify from "slugify"
import { findFreeSlug } from "app/core/utils/findFreeSlug"
import { CompanyObj } from "../validations"
import createFormWithFactoryFormQuestions from "app/forms/mutations/createFormWithFactoryFormQuestions"
import createScoreCardWithFactoryScoreCardQuestions from "app/score-cards/mutations/createScoreCardWithFactoryScoreCardQuestions"
import createWorkflowWithFactoryWorkflowStages from "app/workflows/mutations/createWorkflowWithFactoryWorkflowStages"
import createFactoryCategories from "app/categories/mutations/createFactoryCategories"
import createFactoryCandidatePools from "app/candidate-pools/mutations/createFactoryCandidatePools"
import provideTrail from "app/core/utils/provideTrial"

export default resolver.pipe(
  resolver.zod(CompanyObj),
  async ({ name, logo, website, theme, info }, ctx: Ctx) => {
    const slug = slugify(name, { strict: true })
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
            userId: ctx?.session?.userId || 0,
            role: CompanyUserRole.OWNER,
          },
        },
      },
    })

    const companyId = company?.id || 0

    await createFormWithFactoryFormQuestions("Default", companyId)
    await createScoreCardWithFactoryScoreCardQuestions("Default", companyId)
    await createWorkflowWithFactoryWorkflowStages("Default", companyId)
    await createFactoryCategories(companyId)
    await createFactoryCandidatePools(companyId)

    await ctx.session.$setPublicData({ companyId: company.id || 0 })

    // await provideTrail(ctx?.session?.userId || 0, company.id || 0)

    return company
  }
)
