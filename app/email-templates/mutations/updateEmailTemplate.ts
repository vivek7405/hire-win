import { EmailTemplate, Prisma } from "@prisma/client"
import { findFreeSlug } from "app/core/utils/findFreeSlug"
import { Ctx, resolver } from "blitz"
import db from "db"
import slugify from "slugify"
import { EmailTemplateObj } from "../validations"

type UpdateEmailTemplateInput = Pick<Prisma.EmailTemplateUpdateArgs, "where" | "data"> & {
  initial: EmailTemplate
}
export default async function updateEmailTemplate(
  { where, data, initial }: UpdateEmailTemplateInput,
  ctx: Ctx
) {
  ctx.session.$authorize()

  const { subject, body } = EmailTemplateObj.parse(data)
  const slug = slugify(subject, { strict: true })
  const newSlug: string = await findFreeSlug(
    slug,
    async (e) => await db.emailTemplate.findFirst({ where: { slug: e } })
  )

  const emailTemplate = await db.emailTemplate.update({
    where,
    data: {
      subject,
      body,
      slug: initial.subject !== subject ? newSlug : initial.slug,
    },
  })

  return emailTemplate
}
