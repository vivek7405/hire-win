import { Ctx } from "blitz"
import db, { Prisma, ScoreCard } from "db"
import { ScoreCardObj } from "app/score-cards/validations"
import slugify from "slugify"
import Guard from "app/guard/ability"
import { findFreeSlug } from "app/core/utils/findFreeSlug"

type UpdateScoreCardInput = Pick<Prisma.ScoreCardUpdateArgs, "where" | "data"> & {
  initial: ScoreCard
}

async function updateScoreCard({ where, data, initial }: UpdateScoreCardInput, ctx: Ctx) {
  ctx.session.$authorize()

  const { name } = ScoreCardObj.parse(data)

  const slug = slugify(name, { strict: true, lower: true })
  const newSlug: string = await findFreeSlug(
    slug,
    async (e) => await db.scoreCard.findFirst({ where: { slug: e } })
  )

  const scoreCard = await db.scoreCard.update({
    where,
    data: {
      name,
      slug: initial.name !== name ? newSlug : initial.slug,
    },
  })

  return scoreCard
}

export default Guard.authorize("update", "scoreCard", updateScoreCard)
