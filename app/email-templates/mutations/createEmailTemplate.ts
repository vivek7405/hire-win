import { findFreeSlug } from "app/core/utils/findFreeSlug"
import { Ctx, resolver } from "blitz"
import db from "db"
import slugify from "slugify"
import { EmailTemplateObj } from "../validations"

export default resolver.pipe(
  resolver.zod(EmailTemplateObj),
  resolver.authorize(),
  async ({ subject, body }, ctx: Ctx) => {
    const slug = slugify(subject, { strict: true })
    const newSlug = await findFreeSlug(
      slug,
      async (e) => await db.emailTemplate.findFirst({ where: { slug: e } })
    )

    const emailTemplate = await db.emailTemplate.create({
      data: {
        subject,
        slug: newSlug,
        body,
        companyId: ctx.session.companyId || 0,
      },
    })

    return emailTemplate
  }
)
