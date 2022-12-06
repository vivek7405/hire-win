import { Ctx } from "blitz"
import db, { Prisma } from "db"
import Guard from "src/guard/ability"

type DeleteTokenInput = Pick<Prisma.TokenDeleteArgs, "where">

async function deleteToken({ where }: DeleteTokenInput, ctx: Ctx) {
  ctx.session.$authorize()

  const token = await db.token.delete({
    where,
  })

  return token
}

export default deleteToken
