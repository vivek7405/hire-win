import { Ctx } from "blitz"
import db, { Prisma } from "db"
import slugify from "slugify"
import Guard from "app/guard/ability"
import { findFreeSlug } from "app/core/utils/findFreeSlug"
import { FormQuestionObj } from "../validations"

type UpdateFormQuestionInput = Pick<Prisma.FormQuestionUpdateArgs, "where" | "data">

async function updateFormQuestion({ where, data }: UpdateFormQuestionInput, ctx: Ctx) {
  ctx.session.$authorize()

  const { order, behaviour, title, placeholder, options, acceptedFiles } =
    FormQuestionObj.parse(data)

  const slug = slugify(title, { strict: true, lower: true })

  const currentFormQuestion = await db.formQuestion.findFirst({
    where,
    include: { options: true },
  })

  const optionsToDelete = currentFormQuestion?.options?.filter((op) =>
    options
      ?.filter((opt) => opt.id !== "")
      .map((o) => {
        return o.id
      })
      .includes(op.id)
  )

  const updatedFormQuestion = await db.formQuestion.update({
    where,
    data: {
      title,
      slug,
      order,
      behaviour,
      placeholder,
      acceptedFiles,
      options: {
        delete: optionsToDelete?.map((op) => {
          return { id: op.id }
        }),
        upsert: options?.map((op) => {
          return {
            create: { text: op.text },
            update: { text: op.text },
            where: { id: op.id },
          }
        }),
      },
    },
  })

  return updatedFormQuestion
}

export default updateFormQuestion
