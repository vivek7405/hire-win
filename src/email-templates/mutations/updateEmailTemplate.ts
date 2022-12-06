import { resolver } from "@blitzjs/rpc";
import { EmailTemplate, Prisma } from "@prisma/client"
import { findFreeSlug } from "src/core/utils/findFreeSlug"
import { Ctx } from "blitz";
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

  const { name, subject, body } = EmailTemplateObj.parse(data)
  const slug = slugify(name, { strict: true, lower: true })
  // const newSlug = await findFreeSlug(
  //   slug,
  //   async (e) => await db.emailTemplate.findFirst({ where: { slug: e } })
  // )

  const emailTemplate = await db.emailTemplate.update({
    where,
    data: {
      name,
      subject,
      body,
      slug,
    },
  })

  return emailTemplate
}
