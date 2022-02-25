import { resolver, SecurePassword, Ctx } from "blitz"
import db from "db"
import { Signup } from "app/auth/validations"
import { Role } from "types"
import slugify from "slugify"
import { findFreeSlug } from "app/core/utils/findFreeSlug"
import createFormWithFactoryFormQuestions from "app/forms/mutations/createFormWithFactoryFormQuestions"

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
        role: "USER",
      },
      select: { id: true, email: true, role: true },
    })

    await createFormWithFactoryFormQuestions("Default", user?.id)

    await ctx.session.$create({ userId: user.id, role: user.role as Role })
    return user
  }
)
