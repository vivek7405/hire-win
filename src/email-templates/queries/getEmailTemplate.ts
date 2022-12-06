import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db, { Prisma } from "db"

export default resolver.pipe(
  resolver.authorize(),
  async ({ where }: Pick<Prisma.EmailTemplateFindFirstArgs, "where">, ctx: Ctx) => {
    const emailTemplate = await db.emailTemplate.findFirst({ where })
    return emailTemplate
  }
)
