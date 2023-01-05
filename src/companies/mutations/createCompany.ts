import { resolver } from "@blitzjs/rpc"
import { Ctx, NotFoundError } from "blitz"
import db, { CompanyUserRole, ParentCompanyUserRole } from "db"
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
  async ({ name, logo, website, theme, info, timezone, parentCompanyId }, ctx: Ctx) => {
    if (parentCompanyId) {
      const parentCompany = await db.parentCompany.findUnique({
        where: { id: parentCompanyId },
      })
      if (!parentCompany) {
        throw new NotFoundError("Parent company Id provided doesn't exists")
      }
    }

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

    const existingCompanyUserWhereOwner = await db.companyUser.findFirst({
      where: { userId: ctx?.session?.userId || "0", role: CompanyUserRole.OWNER },
      include: { company: true },
    })

    const parentCompanyIdToUse =
      parentCompanyId || existingCompanyUserWhereOwner?.company?.parentCompanyId || "0"

    let isCompanyCreatedForOthersParentCompany = false
    if (
      parentCompanyId &&
      parentCompanyId !== (existingCompanyUserWhereOwner?.company?.parentCompanyId || "0")
    ) {
      isCompanyCreatedForOthersParentCompany = true
    }

    const company = await db.company.create({
      data: {
        ...data,
        users: {
          create: {
            userId: ctx?.session?.userId || "0",
            role: isCompanyCreatedForOthersParentCompany
              ? CompanyUserRole.ADMIN
              : CompanyUserRole.OWNER,
          },
        },
        parentCompany: {
          connectOrCreate: {
            where: {
              id: parentCompanyIdToUse,
            },
            create: {
              users: {
                create: {
                  userId: ctx?.session?.userId || "0",
                  role: ParentCompanyUserRole.OWNER,
                },
              },
            },
          },
        },
        createdBy: {
          connect: {
            id: ctx?.session?.userId || "0",
          },
        },
      },
    })

    if (isCompanyCreatedForOthersParentCompany) {
      const parentCompanyUserOwner = await db.parentCompanyUser.findFirst({
        where: { parentCompanyId, role: ParentCompanyUserRole.OWNER },
      })

      await db.companyUser.create({
        data: {
          companyId: company?.id || "0",
          userId: parentCompanyUserOwner?.userId || "0",
          role: CompanyUserRole.OWNER,
        },
      })
    }

    // Add user to parent company if not already added
    const existingParentCompanyUser = await db.parentCompanyUser.findFirst({
      where: {
        parentCompanyId: company?.parentCompanyId,
        userId: ctx?.session?.userId || "0",
      },
    })
    const parentCompanyOwnerExists = await db.parentCompanyUser.findFirst({
      where: { parentCompanyId: company?.parentCompanyId, role: ParentCompanyUserRole.OWNER },
    })
    if (!existingParentCompanyUser) {
      await db.parentCompanyUser.create({
        data: {
          role: parentCompanyOwnerExists
            ? ParentCompanyUserRole.ADMIN
            : ParentCompanyUserRole.OWNER,
          parentCompanyId: company?.parentCompanyId,
          userId: ctx?.session?.userId || "0",
        },
      })
    }

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
