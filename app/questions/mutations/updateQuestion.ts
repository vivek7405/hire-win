import { Ctx, resolver } from "blitz"
import db, { Prisma } from "db"
import { Question } from "app/questions/validations"
import slugify from "slugify"
import Guard from "app/guard/ability"
import { ExtendedQuestion } from "types"
import { findFreeSlug } from "app/core/utils/findFreeSlug"

type UpdateQuestionInput = Pick<Prisma.QuestionUpdateArgs, "where" | "data"> & {
  initial: ExtendedQuestion
}

async function updateQuestion({ where, data, initial }: UpdateQuestionInput, ctx: Ctx) {
  ctx.session.$authorize()

  const { name, placeholder, options, acceptedFiles } = Question.parse(data)

  const slug = slugify(name, { strict: true })
  const newSlug: string = await findFreeSlug(
    slug,
    async (e) => await db.question.findFirst({ where: { slug: e } })
  )

  const currentQuestion = await db.question.findFirst({
    where,
    include: { options: true },
  })

  const optionsToDelete = currentQuestion?.options?.filter((op) =>
    options
      ?.filter((opt) => opt.id !== "")
      .map((o) => {
        return o.id
      })
      .includes(op.id)
  )

  const updatedQuestion = await db.question.update({
    where,
    data: {
      name,
      placeholder,
      slug: initial.name !== name ? newSlug : initial.slug,
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

  return updatedQuestion
}

export default Guard.authorize("update", "question", updateQuestion)
