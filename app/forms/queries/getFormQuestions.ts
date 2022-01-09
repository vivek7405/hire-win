import { paginate, Ctx } from "blitz"
import db, { Prisma } from "db"
import Guard from "app/guard/ability"

interface GetFormQuestionInput
  extends Pick<Prisma.FormQuestionFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

async function getFormQuestions(
  { where, orderBy, skip = 0, take = 100 }: GetFormQuestionInput,
  ctx: Ctx
) {
  ctx.session.$authorize()

  const {
    items: formQuestions,
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
        orderBy: { order: "asc" },
        include: {
          question: {
            include: {
              options: true,
            },
          },
        },
      }),
  })

  return {
    formQuestions,
    hasMore,
    count,
  }
}

export default Guard.authorize("readAll", "formQuestion", getFormQuestions)
