import { Ctx, resolver } from "blitz"
import db, { Prisma } from "db"

export default resolver.pipe(
  resolver.authorize(),
  async ({ where }: Pick<Prisma.EmailFindUniqueArgs, "where">, ctx: Ctx) => {
    const email = await db.email.findUnique({
      where,
      include: { sender: true, candidate: true, templateUsed: true },
    })
    return email
  }
)
