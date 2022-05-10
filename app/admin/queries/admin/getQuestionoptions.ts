import { paginate, Ctx } from "blitz"
import db, { Prisma } from "db"

interface GetQuestionoptionsInput
  extends Pick<Prisma.QuestionOptionFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

async function getQuestionoptions(
  { where, orderBy, skip = 0, take = 100 }: GetQuestionoptionsInput,
  ctx: Ctx
) {
  ctx.session.$authorize("ADMIN")

  const {
    items: questionoptions,
    hasMore,
    count,
  } = await paginate({
    skip,
    take,
    count: () => db.questionOption.count({ where }),
    query: (paginateArgs) =>
      db.questionOption.findMany({
        ...paginateArgs,
        where,
        orderBy,
      }),
  })

  return {
    questionoptions,
    hasMore,
    count,
  }
}

export default getQuestionoptions
