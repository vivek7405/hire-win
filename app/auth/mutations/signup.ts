import { resolver, SecurePassword, Ctx } from "blitz"
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

export default resolver.pipe(
  resolver.zod(Signup),
  async ({ name, email, companyName, password }, ctx: Ctx) => {
    const hashedPassword = await SecurePassword.hash(password.trim())

    const slug = slugify(companyName, { strict: true })
    const newSlug = await findFreeSlug(
      slug,
      async (e) => await db.company.findFirst({ where: { slug: e } })
    )

    const user = await db.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        hashedPassword,
        role: UserRole.USER,
        companies: {
          create: {
            role: CompanyUserRole.OWNER,
            company: {
              create: {
                name: companyName,
                slug: newSlug,
              },
            },
          },
        },
      },
      select: { id: true, email: true, role: true, companies: true },
    })

    const companyId = (user.companies && (user.companies[0]?.companyId || 0)) || 0

    await createFormWithFactoryFormQuestions("Default", companyId)
    await createScoreCardWithFactoryScoreCardQuestions("Default", companyId)
    await createWorkflowWithFactoryWorkflowStages("Default", companyId)
    await createFactoryCategories(companyId)
    await createFactoryCandidatePools(companyId)

    await ctx.session.$create({ userId: user.id, role: user.role as UserRole, companyId })

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
)
