import { Ctx, AuthenticationError, resolver } from "blitz"
import db from "db"
import slugify from "slugify"
import { Question, QuestionInputType } from "app/questions/validations"
import Guard from "app/guard/ability"
import { findFreeSlug } from "app/core/utils/findFreeSlug"
import { optionCSS } from "react-select/dist/declarations/src/components/Option"

async function createQuestion(data: QuestionInputType, ctx: Ctx) {
  const { name, placeholder, type, options, required, hidden, acceptedFiles } = Question.parse(data)
  const user = await db.user.findFirst({ where: { id: ctx.session.userId! } })
  if (!user) throw new AuthenticationError()

  const slug = slugify(name, { strict: true })
  const newSlug = await findFreeSlug(
    slug,
    async (e) => await db.question.findFirst({ where: { slug: e } })
  )

  const question = await db.question.create({
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
      required: required,
      hidden: hidden,
      slug: newSlug,
      userId: user.id,
      acceptedFiles: acceptedFiles,
    },
  })

  return question
}

export default resolver.pipe(
  resolver.zod(Question),
  resolver.authorize(),
  Guard.authorize("create", "question", createQuestion)
)
