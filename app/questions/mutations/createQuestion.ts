import { Ctx, AuthenticationError, resolver } from "blitz"
import db from "db"
import slugify from "slugify"
import { Question, QuestionInputType } from "app/questions/validations"
import Guard from "app/guard/ability"
import { findFreeSlug } from "app/core/utils/findFreeSlug"

async function createQuestion(data: QuestionInputType, ctx: Ctx) {
  const { name, info, placeholder, type, required, hidden } = Question.parse(data)
  const user = await db.user.findFirst({ where: { id: ctx.session.userId! } })
  if (!user) throw new AuthenticationError()

  const slug = slugify(name, { strict: true })
  const newSlug = await findFreeSlug(
    slug,
    async (e) => await db.question.findFirst({ where: { slug: e } })
  )

  const question = await db.question.create({
    data: {
      name: name,
      info: info,
      placeholder: placeholder,
      type: type,
      required: required,
      hidden: hidden,
      slug: newSlug,
      userId: user.id,
    },
  })

  return question
}

export default resolver.pipe(
  resolver.zod(Question),
  resolver.authorize(),
  Guard.authorize("create", "question", createQuestion)
)
