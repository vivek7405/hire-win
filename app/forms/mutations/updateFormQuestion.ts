import { Ctx } from "blitz"
import db, { Prisma } from "db"
import { FormObj, FormQuestion } from "app/forms/validations"
import slugify from "slugify"
import Guard from "app/guard/ability"
import { ExtendedForm, ExtendedFormQuestion } from "types"
import { findFreeSlug } from "app/core/utils/findFreeSlug"

type UpdateFormQuestionInput = Pick<Prisma.FormQuestionUpdateArgs, "where" | "data">

async function updateFormQuestion({ where, data }: UpdateFormQuestionInput, ctx: Ctx) {
  ctx.session.$authorize()

  const { order, behaviour } = FormQuestion.parse(data)

  const formQuestion = await db.formQuestion.update({
    where,
    data: {
      order,
      behaviour,
    },
  })

  return formQuestion
}

export default Guard.authorize("update", "formQuestion", updateFormQuestion)
