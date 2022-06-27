import { resolver, SecurePassword, Ctx, NotFoundError } from "blitz"
import db from "db"
import { Signup } from "app/auth/validations"
import slugify from "slugify"
import { findFreeSlug } from "app/core/utils/findFreeSlug"
import createFormWithFactoryFormQuestions from "app/forms/mutations/createFormWithFactoryFormQuestions"
import { CompanyUserRole, UserRole } from "@prisma/client"
import createWorkflowWithFactoryWorkflowStages from "app/workflows/mutations/createWorkflowWithFactoryWorkflowStages"
import createFactoryCategories from "app/categories/mutations/createFactoryCategories"
import createScoreCardWithFactoryScoreCardQuestions from "app/score-cards/mutations/createScoreCardWithFactoryScoreCardQuestions"
import { initialSchedule } from "app/scheduling/constants"
import addCalendar from "app/scheduling/calendars/mutations/addCalendar"
import addSchedule from "app/scheduling/schedules/mutations/addSchedule"
import { mapValues } from "app/core/utils/map-values"
import createFactoryCandidatePools from "app/candidate-pools/mutations/createFactoryCandidatePools"
import stripe from "app/core/utils/stripe"
import { plans } from "app/core/utils/plans"
import { PlanName } from "types"
import provideTrail from "app/core/utils/provideTrial"

type signupProps = {
  name: string
  email?: string
  companyName?: string
  companyId?: number
  password: string
}
export default async function signup(
  { name, email, companyName, companyId, password }: signupProps,
  ctx: Ctx
) {
  if (!email) {
    throw new Error("Email is required")
  }

  if (!companyId && !companyName) {
    throw new Error("Company name is required")
  }

  const hashedPassword = await SecurePassword.hash(password.trim())

  const slug = slugify(companyName || "NA", { strict: true })
  const newSlug = await findFreeSlug(
    slug,
    async (e) => await db.company.findFirst({ where: { slug: e } })
  )

  const existingCompany = await db.company.findFirst({
    where: { id: companyId || 0 },
  })

  const user = await db.user.create({
    data: {
      name,
      email: email.toLowerCase().trim(),
      hashedPassword,
      role: UserRole.USER,
      companies: {
        create: {
          role: existingCompany ? CompanyUserRole.USER : CompanyUserRole.OWNER,
          company: {
            // create: {
            //   name: companyName,
            //   slug: newSlug,
            // },
            connectOrCreate: {
              create: {
                name: companyName || "NA",
                slug: newSlug,
              },
              where: {
                id: existingCompany?.id || 0,
              },
            },
          },
        },
      },
    },
    select: { id: true, email: true, role: true, companies: true },
  })

  const compId = existingCompany?.id || (user.companies && (user.companies[0]?.companyId || 0)) || 0

  if (!existingCompany) {
    await createFactoryCategories(compId)
    await createWorkflowWithFactoryWorkflowStages("Default", compId, true)
    await createFormWithFactoryFormQuestions("Default", compId, true)
    await createScoreCardWithFactoryScoreCardQuestions("Default", compId, true)
    await createFactoryCandidatePools(compId)
  }

  await ctx.session.$create({ userId: user.id, role: user.role as UserRole, companyId: compId })

  await addSchedule(
    {
      name: "Default",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      schedule: initialSchedule,
      factory: true,
    },
    ctx
  )

  // await provideTrail(user?.id, compId)

  return user
}
