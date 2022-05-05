import { paginate, Ctx } from "blitz"
import db, { Prisma } from "db"

interface GetFormsInput
  extends Pick<Prisma.FormFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

async function getForms({ where, orderBy, skip = 0, take = 100 }: GetFormsInput, ctx: Ctx) {
  ctx.session.$authorize("ADMIN")

  const {
    items: forms,
    hasMore,
    count,
  } = await paginate({
    skip,
    take,
    count: () => db.form.count({ where }),
    query: (paginateArgs) =>
      db.form.findMany({
        ...paginateArgs,
        where,
        orderBy,
      }),
  })

  return {
    forms,
    hasMore,
    count,
  }
}

export default getForms
