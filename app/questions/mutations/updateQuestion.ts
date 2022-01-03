import { Ctx } from "blitz"
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

  const { name, info, placeholder, type, required, hidden } = Question.parse(data)

  const slug = slugify(name, { strict: true })
  const newSlug: string = await findFreeSlug(
    slug,
    async (e) => await db.question.findFirst({ where: { slug: e } })
  )

  const question = await db.question.update({
    where,
    data: {
      name: name,
      info: info,
      placeholder: placeholder,
      required: required,
      hidden: hidden,
      slug: initial.name !== name ? newSlug : initial.slug,
    },
  })

  return question
}

export default Guard.authorize("update", "question", updateQuestion)
