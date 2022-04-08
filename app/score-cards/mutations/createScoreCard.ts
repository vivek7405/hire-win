import { Ctx, AuthenticationError } from "blitz"
import db from "db"
import slugify from "slugify"
import { ScoreCardObj, ScoreCardInputType } from "app/score-cards/validations"
import Guard from "app/guard/ability"
import { findFreeSlug } from "app/core/utils/findFreeSlug"
import createScoreCardQuestion from "./createScoreCardQuestion"
import createScoreCardWithFactoryScoreCardQuestions from "./createScoreCardWithFactoryScoreCardQuestions"

async function createScoreCard(data: ScoreCardInputType, ctx: Ctx) {
  ctx.session.$authorize()

  const { name } = ScoreCardObj.parse(data)
  const user = await db.user.findFirst({ where: { id: ctx.session.userId! } })
  if (!user) throw new AuthenticationError()

  // const slug = slugify(name, { strict: true })
  // const newSlug = await findFreeSlug(
  //   slug,
  //   async (e) => await db.scoreCard.findFirst({ where: { slug: e } })
  // )

  // const scoreCard = await db.scoreCard.create({
  //   data: {
  //     name: name,
  //     slug: newSlug,
  //     userId: user.id,
  //   },
  // })

  const scoreCard = await createScoreCardWithFactoryScoreCardQuestions(name, user.id)

  return scoreCard
}

export default Guard.authorize("create", "scoreCard", createScoreCard)
