import Guard from "app/guard/ability"
import { paginate, resolver } from "blitz"
import db, { Prisma } from "db"

interface GetFormsInput
  extends Pick<Prisma.FormFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

const getForms = resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetFormsInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: forms,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.form.count({ where }),
      query: (paginateArgs) =>
        db.form.findMany({
          ...paginateArgs,
          where,
          include: {
            questions: { include: { question: true }, orderBy: { order: "asc" } },
            jobs: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        }),
    })

    return {
      forms,
      nextPage,
      hasMore,
      count,
    }
  }
)

export default Guard.authorize("readAll", "form", getForms)
