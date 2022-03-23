import Guard from "app/guard/ability"
import { paginate, resolver } from "blitz"
import db, { Prisma } from "db"

interface GetQuestionsInput
  extends Pick<Prisma.QuestionFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

const getQuestions = resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetQuestionsInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: questions,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.question.count({ where }),
      query: (paginateArgs) =>
        db.question.findMany({
          ...paginateArgs,
          where,
          orderBy,
          include: {
            forms: { include: { form: true } },
          },
        }),
    })

    return {
      questions,
      nextPage,
      hasMore,
      count,
    }
  }
)

export default Guard.authorize("readAll", "question", getQuestions)
