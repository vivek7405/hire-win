import { Ctx, resolver } from "blitz"
import db, { Prisma } from "db"

interface GetEmailTemplatesInput extends Pick<Prisma.EmailTemplateFindManyArgs, "where"> {}

const getEmailTemplatesWOPagination = resolver.pipe(
  resolver.authorize(),
  async ({ where }: GetEmailTemplatesInput, ctx: Ctx) => {
    const emailTemplates = await db.emailTemplate.findMany({
      where,
      include: {
        _count: { select: { emails: true } },
      },
      orderBy: { createdAt: "asc" },
    })
    return emailTemplates
  }
)

export default getEmailTemplatesWOPagination
