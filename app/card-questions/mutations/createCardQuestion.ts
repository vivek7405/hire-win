import { Ctx, AuthenticationError, resolver } from "blitz"
import db from "db"
import slugify from "slugify"
import { CardQuestion, CardQuestionInputType } from "app/card-questions/validations"
import Guard from "app/guard/ability"
import { findFreeSlug } from "app/core/utils/findFreeSlug"

async function createCardQuestion(data: CardQuestionInputType, ctx: Ctx) {
  const { name } = CardQuestion.parse(data)
  // const user = await db.user.findFirst({ where: { id: ctx.session.userId! } })
  // if (!user) throw new AuthenticationError()

  const slug = slugify(name, { strict: true, lower: true })
  // const newSlug = await findFreeSlug(
  //   slug,
  //   async (e) => await db.cardQuestion.findFirst({ where: { slug: e } })
  // )

  const cardQuestion = await db.cardQuestion.create({
    data: {
      name,
      slug,
      companyId: ctx.session.companyId || "0",
    },
  })

  return cardQuestion
}

export default resolver.pipe(
  resolver.zod(CardQuestion),
  resolver.authorize(),
  Guard.authorize("create", "cardQuestion", createCardQuestion)
)
