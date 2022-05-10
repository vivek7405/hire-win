import { paginate, Ctx } from "blitz"
import db, { Prisma } from "db"

interface GetStagesInput
  extends Pick<Prisma.StageFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

async function getStages({ where, orderBy, skip = 0, take = 100 }: GetStagesInput, ctx: Ctx) {
  ctx.session.$authorize("ADMIN")

  const {
    items: stages,
    hasMore,
    count,
  } = await paginate({
    skip,
    take,
    count: () => db.stage.count({ where }),
    query: (paginateArgs) =>
      db.stage.findMany({
        ...paginateArgs,
        where,
        orderBy,
      }),
  })

  return {
    stages,
    hasMore,
    count,
  }
}

export default getStages
