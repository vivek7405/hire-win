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

  // Don't allow updating the name for Default Score Card
  if (initial?.name?.toLowerCase() === "default") {
    throw new Error("Cannot update the name for 'Default' score card")
  }

  const slug = slugify(name, { strict: true, lower: true })
  // const newSlug = await findFreeSlug(
  //   slug,
  //   async (e) => await db.scoreCard.findFirst({ where: { slug: e } })
  // )

  const scoreCard = await db.scoreCard.update({
    where,
    data: {
      name,
      slug,
    },
  })

  return scoreCard
}

export default Guard.authorize("update", "scoreCard", updateScoreCard)
