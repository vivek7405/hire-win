import { Ctx, AuthenticationError } from "blitz"
import db from "db"
import { FormQuestions, FormQuestionsInputType } from "app/forms/validations"
import Guard from "app/guard/ability"

async function addExistingFormQuestions(data: FormQuestionsInputType, ctx: Ctx) {
  ctx.session.$authorize()

  const { formId, questionIds } = FormQuestions.parse(data)
  const user = await db.user.findFirst({ where: { id: ctx.session.userId! } })
  if (!user) throw new AuthenticationError()

  const order = (await db.formQuestion.count({ where: { formId: formId } })) + 1

  // const formQuestion = await db.formQuestion.create({
  //   data: {
  //     order: order,
  //     formId: formId!,
  //     questionId: questionId!,
  //   },
  // })

  const form = await db.form.update({
    where: { id: formId },
    data: {
      questions: {
        createMany: {
          data: questionIds.map((qId, index) => {
            return {
              order: order + index,
              questionId: qId,
            }
          }),
        },
      },
    },
  })

  return form
}

export default Guard.authorize("create", "formQuestion", addExistingFormQuestions)
