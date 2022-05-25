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

type signupProps = {
  name: string
  email: string
  companyName?: string
  companyId?: number
  password: string
}
export default async function signup(
  { name, email, companyName, companyId, password }: signupProps,
  ctx: Ctx
) {
  const hashedPassword = await SecurePassword.hash(password.trim())

  if (!companyId && !companyName) {
    throw new Error("Company name is required")
  }

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
    await createFormWithFactoryFormQuestions("Default", compId)
    await createScoreCardWithFactoryScoreCardQuestions("Default", compId)
    await createWorkflowWithFactoryWorkflowStages("Default", compId)
    await createFactoryCategories(compId)
    await createFactoryCandidatePools(compId)
  }

  await ctx.session.$create({ userId: user.id, role: user.role as UserRole, companyId: compId })

  await addSchedule(
    {
      name: "Default",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      schedule: mapValues(initialSchedule, ({ blocked, start, end }) =>
        blocked
          ? { startTime: "00:00", endTime: "00:00" }
          : { startTime: "09:00", endTime: "17:00" }
      ),
    },
    ctx
  )

  return user
}
