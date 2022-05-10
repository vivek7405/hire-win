import { Ctx } from "blitz"
import db, { Prisma } from "db"

type UpdateQuestionoptionInput = Pick<Prisma.QuestionOptionUpdateArgs, "where" | "data">

async function updateQuestionoption({ where, data }: UpdateQuestionoptionInput, ctx: Ctx) {
  ctx.session.$authorize("ADMIN")

  const questionoption = await db.questionOption.update({
    where,
    data,
  })

  return questionoption
}

export default updateQuestionoption
