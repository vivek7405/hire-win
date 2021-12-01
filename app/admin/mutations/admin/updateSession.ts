import { Ctx } from "blitz"
import db, { Prisma } from "db"

type UpdateSessionInput = Pick<Prisma.SessionUpdateArgs, "where" | "data">

async function updateSession({ where, data }: UpdateSessionInput, ctx: Ctx) {
  ctx.session.$authorize("ADMIN")

  const session = await db.session.update({
    where,
    data,
  })

  return session
}

export default updateSession
