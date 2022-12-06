import { Ctx } from "blitz";
import db from "db"
import { FormQuestionInputType, FormQuestionObj } from "src/form-questions/validations"
import Guard from "src/guard/ability"
import slugify from "slugify"

async function createFormQuestion(data: FormQuestionInputType, ctx: Ctx) {
  ctx.session.$authorize()

  const { title, placeholder, type, options, acceptedFiles, jobId } = FormQuestionObj.parse(data)
  const slug = slugify(title, { strict: true, lower: true })

  const order = (await db.formQuestion.count({ where: { jobId } })) + 1

  const formQuestion = await db.formQuestion.create({
    data: {
      title,
      placeholder,
      type,
      options: {
        create: options?.map((op) => {
          return {
            text: op.text,
          }
        }),
      },
      slug,
      jobId: jobId || "0",
      createdById: ctx.session.userId || "0",
      acceptedFiles: acceptedFiles,
      order,
    },
  })

  return formQuestion
}

export default createFormQuestion
