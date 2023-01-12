import { resolver } from "@blitzjs/rpc"
import { findFreeSlug } from "src/core/utils/findFreeSlug"
import { Ctx, NotFoundError } from "blitz"
import db from "db"
import slugify from "slugify"
import { EmailTemplateObj } from "../validations"

export default resolver.pipe(
  resolver.zod(EmailTemplateObj),
  resolver.authorize(),
  async ({ name, subject, body, parentCompanyId }, ctx: Ctx) => {
    if (parentCompanyId) {
      const parentCompany = await db.parentCompany.findUnique({
        where: { id: parentCompanyId || "0" },
      })
      if (!parentCompany) {
        throw new NotFoundError("Parent company with provided id not found")
      }
    }

    const slug = slugify(name, { strict: true, lower: true })
    // const newSlug = await findFreeSlug(
    //   slug,
    //   async (e) => await db.emailTemplate.findFirst({ where: { slug: e,  } })
    // )

    const emailTemplate = await db.emailTemplate.create({
      data: {
        name,
        subject,
        slug,
        body,
        companyId: parentCompanyId ? null : ctx.session.companyId || "0",
        parentCompanyId: parentCompanyId || null,
        createdById: ctx.session.userId || "0",
      },
    })

    return emailTemplate
  }
)
