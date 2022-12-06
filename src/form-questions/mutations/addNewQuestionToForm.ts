import { Ctx } from "blitz";
import db from "db"
import {
  FormQuestionInputType,
  FormQuestionObj,
  FormQuestionsInputType,
} from "src/form-questions/validations"
import Guard from "src/guard/ability"
import slugify from "slugify"
import { findFreeSlug } from "src/core/utils/findFreeSlug"
import shiftFormQuestion from "./shiftFormQuestion"
import { ShiftDirection } from "types"
import createFormQuestion from "./createFormQuestion"

async function addNewQuestionToForm(data: FormQuestionInputType, ctx: Ctx) {
  ctx.session.$authorize()

  const { title, placeholder, type, options, acceptedFiles, jobId } = FormQuestionObj.parse(data)
  const slug = slugify(title, { strict: true, lower: true })

  const order = (await db.formQuestion.count({ where: { jobId } })) + 1

  const formQuestion = await db.formQuestion.create({
    data: {
      jobId: jobId || "0",
      title,
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
