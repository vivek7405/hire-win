import { resolver, SecurePassword, Ctx } from "blitz"
import db from "db"
import { Signup } from "app/auth/validations"
import slugify from "slugify"
import { findFreeSlug } from "app/core/utils/findFreeSlug"
import createFormWithFactoryFormQuestions from "app/forms/mutations/createFormWithFactoryFormQuestions"
import { UserRole } from ".prisma1/client"
import createWorkflowWithFactoryWorkflowStages from "app/workflows/mutations/createWorkflowWithFactoryWorkflowStages"
import createFactoryCategories from "app/categories/mutations/createFactoryCategories"
import createScoreCardWithFactoryScoreCardQuestions from "app/score-cards/mutations/createScoreCardWithFactoryScoreCardQuestions"

export default resolver.pipe(
  resolver.zod(Signup),
  async ({ email, companyName, password }, ctx: Ctx) => {
    const hashedPassword = await SecurePassword.hash(password.trim())

    const slug = slugify(companyName, { strict: true })
    const newSlug = await findFreeSlug(
      slug,
      async (e) => await db.user.findFirst({ where: { slug: e } })
    )

    const user = await db.user.create({
      data: {
        email: email.toLowerCase().trim(),
        companyName,
        slug: newSlug,
        hashedPassword,
        role: UserRole.USER,
      },
      select: { id: true, email: true, role: true },
    })

    await createFormWithFactoryFormQuestions("Default", user?.id)
    await createScoreCardWithFactoryScoreCardQuestions("Default", user?.id)
    await createWorkflowWithFactoryWorkflowStages("Default", user?.id)
    await createFactoryCategories(user?.id)

    await ctx.session.$create({ userId: user.id, role: user.role as UserRole })
    return user
  }
)
