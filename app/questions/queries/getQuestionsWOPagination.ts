import Guard from "app/guard/ability"
import { resolver } from "blitz"
import db, { Prisma } from "db"

interface GetQuestionsInput extends Pick<Prisma.QuestionFindManyArgs, "where"> {}

const getQuestionsWOPagination = resolver.pipe(
  resolver.authorize(),
  async ({ where }: GetQuestionsInput) => {
    const questions = await db.question.findMany({ where })
    return questions
  }
)

export default Guard.authorize("readAll", "question", getQuestionsWOPagination)
