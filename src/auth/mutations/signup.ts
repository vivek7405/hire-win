import { SecurePassword } from "@blitzjs/auth"
import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { Signup } from "src/auth/validations"
import slugify from "slugify"
import { findFreeSlug } from "src/core/utils/findFreeSlug"
import { CompanyUserRole, UserRole } from "@prisma/client"
import { initialSchedule } from "src/schedules/constants"
import addCalendar from "src/calendars/mutations/addCalendar"
import addSchedule from "src/schedules/mutations/addSchedule"
import { mapValues } from "src/core/utils/map-values"
import stripe from "src/core/utils/stripe"
import { Currency, PlanName } from "types"
import provideTrail from "src/core/utils/provideTrial"
import createFactoryItems from "./createFactoryItems"
import updateDefaultSchedule from "src/schedules/mutations/updateDefaultSchedule"
import createFactoryJob from "src/jobs/mutations/createFactoryJob"
import { initialInfo } from "src/companies/constants"

type signupProps = {
  name: string
  email?: string
  companyName?: string
  companyId?: string
  companyUserRole?: CompanyUserRole
  password: string
  timezone?: string | null | undefined
  currency?: Currency
}
export default async function signup(
  {
    name,
    email,
    companyName,
    companyId,
    companyUserRole,
    password,
    timezone,
  }: // currency,
  signupProps,
  ctx: Ctx
) {
  if (!email) {
    throw new Error("Email is required")
  }

  if (!companyId && !companyName) {
    throw new Error("Company name is required")
  }

  const hashedPassword = await SecurePassword.hash(password.trim())

  const slug = slugify(companyName || "NA", { strict: true, lower: true })
  const newSlug = await findFreeSlug(
    slug,
    async (e) => await db.company.findFirst({ where: { slug: e } })
  )

  const existingCompany = await db.company.findFirst({
    where: { id: companyId || "0" },
  })

  const user = await db.user.create({
    data: {
      name,
      email: email.toLowerCase().trim(),
      hashedPassword,
      role: UserRole.USER,
      companies: {
        create: {
          role: existingCompany ? companyUserRole || CompanyUserRole.USER : CompanyUserRole.OWNER,
          company: {
            // create: {
            //   name: companyName,
            //   slug: newSlug,
            // },
            connectOrCreate: {
              create: {
                name: companyName || "NA",
                slug: newSlug,
                info: initialInfo,
              },
              where: {
                id: existingCompany?.id || "0",
              },
            },
          },
        },
      },
    },
    select: { id: true, email: true, role: true, companies: true },
  })

  const compId =
    existingCompany?.id || (user.companies && (user.companies[0]?.companyId || "0")) || "0"

  await ctx.session.$create({ userId: user.id, role: user.role as UserRole, companyId: compId })

  const schedule = await addSchedule(
    {
      name: "9 to 5 Weekdays",
      timezone: timezone || "UTC",
      schedule: initialSchedule,
    },
    ctx
  )
  await updateDefaultSchedule(schedule.id || "0", ctx)

  if (!existingCompany) {
    await createFactoryItems({ companyId: compId }, ctx)
    // currency && (await provideTrail(user?.id, compId, currency))

    // Always keep factory job at last
    await createFactoryJob(compId, ctx)
  }

  return user
}
