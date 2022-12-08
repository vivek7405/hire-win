import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db, { CompanyUserRole } from "db"
import slugify from "slugify"
import { findFreeSlug } from "src/core/utils/findFreeSlug"
import { CompanyObj } from "../validations"
import provideTrail from "src/core/utils/provideTrial"
import Guard from "src/guard/ability"
import createFactoryItems from "src/auth/mutations/createFactoryItems"
import addSchedule from "src/schedules/mutations/addSchedule"
import updateDefaultSchedule from "src/schedules/mutations/updateDefaultSchedule"
import { initialSchedule } from "src/schedules/constants"
import createFactoryJob from "src/jobs/mutations/createFactoryJob"

export default resolver.pipe(
  resolver.zod(CompanyObj),
  async ({ name, logo, website, theme, info, timezone }, ctx: Ctx) => {
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

    const existingUserSchedule = await db.schedule.findFirst({
      where: { userId: ctx?.session?.userId || "0" },
    })

    if (!existingUserSchedule) {
      const schedule = await addSchedule(
        {
          name: "9 to 5 Weekdays",
          timezone: timezone || "UTC",
          schedule: initialSchedule,
        },
        ctx
      )
      await updateDefaultSchedule(schedule.id || "0", ctx)
    }

    await createFactoryItems({ companyId }, ctx)
    // await createFactoryJob(companyId, ctx)

    // await provideTrail(ctx?.session?.userId || "0", company.id || "0")

    return company
  }
)
