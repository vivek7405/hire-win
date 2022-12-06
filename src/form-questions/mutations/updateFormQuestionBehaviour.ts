import { Ctx } from "blitz"
import db, { Prisma } from "db"
import { FormQuestionObj } from "../validations"

type UpdateFormQuestionInput = Pick<Prisma.FormQuestionUpdateArgs, "where" | "data">

async function updateFormQuestionBehaviour({ where, data }: UpdateFormQuestionInput, ctx: Ctx) {
  ctx.session.$authorize()

  const { behaviour } = FormQuestionObj.parse(data)

  const updatedFormQuestion = await db.formQuestion.update({
    where,
    data: { behaviour },
  })

  return updatedFormQuestion
}

export default updateFormQuestionBehaviour
