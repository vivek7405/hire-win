import { paginate, Ctx } from "blitz"
import db, { Prisma } from "db"

interface GetTokensInput
  extends Pick<Prisma.TokenFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

async function getTokens({ where, orderBy, skip = 0, take = 100 }: GetTokensInput, ctx: Ctx) {
  ctx.session.$authorize("ADMIN")

  const {
    items: tokens,
    hasMore,
    count,
  } = await paginate({
    skip,
    take,
    count: () => db.token.count({ where }),
    query: (paginateArgs) =>
      db.token.findMany({
        ...paginateArgs,
        where,
        orderBy,
      }),
  })

  return {
    tokens,
    hasMore,
    count,
  }
}

export default getTokens
