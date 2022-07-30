import { Ctx } from "blitz"
import db, { Prisma } from "db"

type UpdateTokenInput = Pick<Prisma.TokenUpdateArgs, "where" | "data">

async function updateToken({ where, data }: UpdateTokenInput, ctx: Ctx) {
  ctx.session.$authorize("ADMIN")

  const token = await db.token.update({
    where,
    data,
  })

  return token
}

export default updateToken
