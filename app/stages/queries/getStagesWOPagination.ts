import Guard from "app/guard/ability"
import { resolver } from "blitz"
import db, { Prisma } from "db"

interface GetStagesInput extends Pick<Prisma.StageFindManyArgs, "where"> {}

const getStagesWOPagination = resolver.pipe(
  resolver.authorize(),
  async ({ where }: GetStagesInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const categories = await db.stage.findMany({ where })

    return categories
  }
)

export default Guard.authorize("readAll", "stage", getStagesWOPagination)
