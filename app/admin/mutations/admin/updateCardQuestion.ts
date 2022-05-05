import { Ctx } from "blitz"
import db, { Prisma } from "db"

type UpdateCardquestionInput = Pick<Prisma.CardQuestionUpdateArgs, "where" | "data">

async function updateCardquestion({ where, data }: UpdateCardquestionInput, ctx: Ctx) {
  ctx.session.$authorize("ADMIN")

  const cardquestion = await db.cardQuestion.update({
    where,
    data,
  })

  return cardquestion
}

export default updateCardquestion
