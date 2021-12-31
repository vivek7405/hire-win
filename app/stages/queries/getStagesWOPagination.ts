import Guard from "app/guard/ability"
import { resolver } from "blitz"
import db, { Prisma } from "db"

interface GetStagesInput extends Pick<Prisma.StageFindManyArgs, "where"> {}

const getStagesWOPagination = resolver.pipe(
  resolver.authorize(),
  async ({ where }: GetStagesInput) => {
    const stages = await db.stage.findMany({ where })
    return stages
  }
)

export default Guard.authorize("readAll", "stage", getStagesWOPagination)
