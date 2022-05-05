import { Ctx } from "blitz"
import db, { Prisma } from "db"
import { CardQuestion as CardQuestionObj } from "app/card-questions/validations"
import slugify from "slugify"
import Guard from "app/guard/ability"
import { findFreeSlug } from "app/core/utils/findFreeSlug"
import { CardQuestion } from "@prisma/client"

type UpdateCardQuestionInput = Pick<Prisma.CardQuestionUpdateArgs, "where" | "data"> & {
  initial: CardQuestion
}

async function updateCardQuestion({ where, data, initial }: UpdateCardQuestionInput, ctx: Ctx) {
  ctx.session.$authorize()

  const { name } = CardQuestionObj.parse(data)

  const slug = slugify(name, { strict: true })
  const newSlug: string = await findFreeSlug(
    slug,
    async (e) => await db.cardQuestion.findFirst({ where: { slug: e } })
  )

  const updatedCardQuestion = await db.cardQuestion.update({
    where,
    data: {
      name,
      slug: initial.name !== name ? newSlug : initial.slug,
    },
  })

  return updatedCardQuestion
}

export default Guard.authorize("update", "cardQuestion", updateCardQuestion)
