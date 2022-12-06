import { resolver } from "@blitzjs/rpc";
import { Ctx } from "blitz";
import db, { Prisma } from "db"

interface GetEmailsInput extends Pick<Prisma.EmailFindManyArgs, "where"> {}

const getEmails = resolver.pipe(
  resolver.authorize(),
  async ({ where }: GetEmailsInput, ctx: Ctx) => {
    const emails = await db.email.findMany({
      where: { ...where },
      include: { sender: true, candidate: true, templateUsed: true },
      orderBy: { createdAt: "asc" },
    })
    return emails
  }
)

export default getEmails
