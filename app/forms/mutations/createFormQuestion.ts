import { Ctx, AuthenticationError } from "blitz"
import db from "db"
import { FormQuestion, FormQuestionInputType } from "app/forms/validations"
import Guard from "app/guard/ability"

async function createFormQuestion(data: FormQuestionInputType, ctx: Ctx) {
  ctx.session.$authorize()

  const { formId, questionId } = FormQuestion.parse(data)
  const user = await db.user.findFirst({ where: { id: ctx.session.userId! } })
  if (!user) throw new AuthenticationError()

  const order = (await db.formQuestion.count({ where: { formId: formId } })) + 1

  const formQuestion = await db.formQuestion.create({
    data: {
      order: order,
      formId: formId!,
      questionId: questionId,
    },
  })

  return formQuestion
}

export default Guard.authorize("create", "formQuestion", createFormQuestion)
