import { Ctx } from "blitz"
import db, { Prisma } from "db"

type UpdateEmailInput = Pick<Prisma.EmailUpdateArgs, "where" | "data">

async function updateEmail({ where, data }: UpdateEmailInput, ctx: Ctx) {
  ctx.session.$authorize("ADMIN")

  const email = await db.email.update({
    where,
    data,
  })

  return email
}

export default updateEmail
