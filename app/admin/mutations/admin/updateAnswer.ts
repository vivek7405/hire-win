import { Ctx } from "blitz"
import db, { Prisma } from "db"

type UpdateAnswerInput = Pick<Prisma.AnswerUpdateArgs, "where" | "data">

async function updateAnswer({ where, data }: UpdateAnswerInput, ctx: Ctx) {
  ctx.session.$authorize("ADMIN")

  const answer = await db.answer.update({
    where,
    data,
  })

  return answer
}

export default updateAnswer
