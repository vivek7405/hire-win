import { Ctx, AuthenticationError, resolver } from "blitz"
import db from "db"
import slugify from "slugify"
import { Question, QuestionInputType } from "app/questions/validations"
import Guard from "app/guard/ability"
import { findFreeSlug } from "app/core/utils/findFreeSlug"

async function createQuestion(data: QuestionInputType, ctx: Ctx) {
  const { name, placeholder, type, options, acceptedFiles } = Question.parse(data)
  // const user = await db.user.findFirst({ where: { id: ctx.session.userId! } })
  // if (!user) throw new AuthenticationError()

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
      slug: newSlug,
      companyId: ctx.session.companyId || 0,
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
