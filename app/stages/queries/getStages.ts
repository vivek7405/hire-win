import Guard from "app/guard/ability"
import { paginate, resolver } from "blitz"
import db, { Prisma } from "db"

interface GetStagesInput
  extends Pick<Prisma.StageFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

const getStages = resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetStagesInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: stages,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.stage.count({ where }),
      query: (paginateArgs) => db.stage.findMany({ ...paginateArgs, where, orderBy }),
    })

    return {
      stages,
      nextPage,
      hasMore,
      count,
    }
  }
)

export default Guard.authorize("readAll", "stage", getStages)
