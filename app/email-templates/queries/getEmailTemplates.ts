import { Ctx, resolver } from "blitz"
import db, { Prisma } from "db"

interface GetEmailTemplatesInput extends Pick<Prisma.EmailTemplateFindManyArgs, "where"> {}

const getEmailTemplates = resolver.pipe(
  resolver.authorize(),
  async ({ where }: GetEmailTemplatesInput, ctx: Ctx) => {
    const emailTemplates = await db.emailTemplate.findMany({
      where,
      orderBy: { createdAt: "asc" },
    })
    return emailTemplates
  }
)

export default getEmailTemplates
