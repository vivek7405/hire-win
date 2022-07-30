import { Ctx } from "blitz"
import db, { Prisma } from "db"

type UpdateEmailtemplateInput = Pick<Prisma.EmailTemplateUpdateArgs, "where" | "data">

async function updateEmailtemplate({ where, data }: UpdateEmailtemplateInput, ctx: Ctx) {
  ctx.session.$authorize("ADMIN")

  const emailtemplate = await db.emailTemplate.update({
    where,
    data,
  })

  return emailtemplate
}

export default updateEmailtemplate
