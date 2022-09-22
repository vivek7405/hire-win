import { Ctx, AuthenticationError } from "blitz"
import db from "db"
import { FormQuestionInputType, FormQuestionObj } from "app/form-questions/validations"
import Guard from "app/guard/ability"
import slugify from "slugify"

async function createFormQuestion(data: FormQuestionInputType, ctx: Ctx) {
  ctx.session.$authorize()

  const { name, placeholder, type, options, acceptedFiles, jobId } = FormQuestionObj.parse(data)
  const slug = slugify(name, { strict: true, lower: true })

  const order = (await db.formQuestion.count({ where: { jobId } })) + 1

  const formQuestion = await db.formQuestion.create({
    data: {
      name,
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
