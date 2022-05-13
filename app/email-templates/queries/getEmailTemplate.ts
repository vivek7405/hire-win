import { Ctx, resolver } from "blitz"
import db, { Prisma } from "db"

export default resolver.pipe(
  resolver.authorize(),
  async ({ where }: Pick<Prisma.EmailTemplateFindUniqueArgs, "where">, ctx: Ctx) => {
    const emailTemplate = await db.emailTemplate.findUnique({ where })
    return emailTemplate
  }
)
