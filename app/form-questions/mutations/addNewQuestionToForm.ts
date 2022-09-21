import { Ctx, AuthenticationError } from "blitz"
import db from "db"
import {
  FormQuestionInputType,
  FormQuestionObj,
  FormQuestionsInputType,
} from "app/form-questions/validations"
import Guard from "app/guard/ability"
import slugify from "slugify"
import { findFreeSlug } from "app/core/utils/findFreeSlug"
import shiftFormQuestion from "./shiftFormQuestion"
import { ShiftDirection } from "types"
import createFormQuestion from "./createFormQuestion"

async function addNewQuestionToForm(data: FormQuestionInputType, ctx: Ctx) {
  ctx.session.$authorize()

  const { name, placeholder, type, options, acceptedFiles, jobId } = FormQuestionObj.parse(data)
  const slug = slugify(name, { strict: true, lower: true })

  const order = (await db.formQuestion.count({ where: { jobId } })) + 1

  const formQuestion = await db.formQuestion.create({
    data: {
      jobId: jobId || "0",
      name,
      slug,
      order,
      placeholder,
      type,
      options: {
        create: options?.map((op) => {
          return {
            text: op.text,
          }
        }),
      },
      createdById: ctx.session.userId || "0",
      acceptedFiles: acceptedFiles,
    },
  })

  return formQuestion
}

export default addNewQuestionToForm
