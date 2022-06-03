import { Ctx, AuthenticationError } from "blitz"
import db from "db"
import { FormQuestions, FormQuestionsInputType } from "app/forms/validations"
import Guard from "app/guard/ability"
import factoryFormQuestions from "app/questions/utils/factoryFormQuestions"
import { QuestionObj, QuestionInputType } from "app/questions/validations"
import createQuestion from "app/questions/mutations/createQuestion"
import slugify from "slugify"
import { findFreeSlug } from "app/core/utils/findFreeSlug"
import shiftFormQuestion from "./shiftFormQuestion"
import { ShiftDirection } from "types"
import createFormQuestion from "./createFormQuestion"

async function addNewQuestionToForm(data: QuestionInputType, ctx: Ctx) {
  ctx.session.$authorize()

  const { formId, name } = QuestionObj.parse(data)
  const user = await db.user.findFirst({ where: { id: ctx.session.userId! } })
  if (!user) throw new AuthenticationError()

  const question = await createQuestion(data, ctx)
  const formQuestion = await createFormQuestion({ formId, questionId: question.id }, ctx)

  return formQuestion
}

export default Guard.authorize("create", "formQuestion", addNewQuestionToForm)
