import Guard from "app/guard/ability"
import { Ctx, NotFoundError } from "blitz"
import db, { Prisma } from "db"

interface GetTokenInput extends Pick<Prisma.TokenFindManyArgs, "where"> {}

async function getTokens({ where }: GetTokenInput, ctx: Ctx) {
  const tokens = await db.token.findMany({
    where,
  })

  if (!tokens) throw new NotFoundError()

  return tokens
}

export default Guard.authorize("read", "tokens", getTokens)
