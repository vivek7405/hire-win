import { paginate, Ctx } from "blitz"
import db, { Prisma } from "db"

interface GetFormquestionsInput
  extends Pick<Prisma.FormQuestionFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

async function getFormquestions(
  { where, orderBy, skip = 0, take = 100 }: GetFormquestionsInput,
  ctx: Ctx
) {
  ctx.session.$authorize("ADMIN")

  const {
    items: formquestions,
    hasMore,
    count,
  } = await paginate({
    skip,
    take,
    count: () => db.formQuestion.count({ where }),
    query: (paginateArgs) =>
      db.formQuestion.findMany({
        ...paginateArgs,
        where,
        orderBy,
      }),
  })

  return {
    formquestions,
    hasMore,
    count,
  }
}

export default getFormquestions
