// @ts-nocheck
import { paginate, Ctx } from "blitz"
import db, { Prisma } from "db"

interface Get__ModelName__sInput
  extends Pick<Prisma.__ModelName__FindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

async function get__ModelName__s(
  { where, orderBy, skip = 0, take = 100 }: Get__ModelName__sInput,
  ctx: Ctx
) {
  ctx.session.$authorize("ADMIN")

  const {
    items: __modelName__s,
    hasMore,
    count,
  } = await paginate({
    skip,
    take,
    count: () => db.__modelName__.count({ where }),
    query: (paginateArgs) =>
      db.__modelName__.findMany({
        ...paginateArgs,
        where,
        orderBy,
      }),
  })

  return {
    __modelName__s,
    hasMore,
    count,
  }
}

export default get__ModelName__s
