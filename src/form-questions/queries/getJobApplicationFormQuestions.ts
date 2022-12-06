import { Ctx } from "blitz"
import db, { Prisma } from "db"
import Guard from "src/guard/ability"

interface GetFormQuestionInput extends Pick<Prisma.FormQuestionFindManyArgs, "where" | "orderBy"> {}

async function getJobApplicationFormQuestions({ where }: GetFormQuestionInput, ctx: Ctx) {
  const formQuestions = db.formQuestion.findMany({
    where,
    orderBy: { order: "asc" },
    include: { options: true },
  })

  return formQuestions
}

export default getJobApplicationFormQuestions
