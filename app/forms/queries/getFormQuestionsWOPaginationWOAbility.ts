import { Ctx } from "blitz"
import db, { Prisma } from "db"
import Guard from "app/guard/ability"

interface GetFormQuestionInput extends Pick<Prisma.FormQuestionFindManyArgs, "where" | "orderBy"> {}

async function getFormQuestionsWOPaginationWOAbility({ where }: GetFormQuestionInput, ctx: Ctx) {
  const formQuestions = db.formQuestion.findMany({
    where,
    orderBy: { order: "asc" },
    include: {
      question: {
        include: {
          options: true,
        },
      },
    },
  })

  return formQuestions
}

export default getFormQuestionsWOPaginationWOAbility
