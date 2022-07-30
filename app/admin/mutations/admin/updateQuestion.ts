import { Ctx } from "blitz"
import db, { Prisma } from "db"

type UpdateQuestionInput = Pick<Prisma.QuestionUpdateArgs, "where" | "data">

async function updateQuestion({ where, data }: UpdateQuestionInput, ctx: Ctx) {
  ctx.session.$authorize("ADMIN")

  const question = await db.question.update({
    where,
    data,
  })

  return question
}

export default updateQuestion
