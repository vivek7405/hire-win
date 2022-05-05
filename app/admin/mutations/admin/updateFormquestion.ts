import { Ctx } from "blitz"
import db, { Prisma } from "db"

type UpdateFormquestionInput = Pick<Prisma.FormQuestionUpdateArgs, "where" | "data">

async function updateFormquestion({ where, data }: UpdateFormquestionInput, ctx: Ctx) {
  ctx.session.$authorize("ADMIN")

  const formquestion = await db.formQuestion.update({
    where,
    data,
  })

  return formquestion
}

export default updateFormquestion
