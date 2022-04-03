import { Ctx } from "blitz"
import db, { Prisma } from "db"
import { ScoreCardObj, ScoreCardQuestion } from "app/score-cards/validations"
import slugify from "slugify"
import Guard from "app/guard/ability"
import { ExtendedScoreCard, ExtendedScoreCardQuestion } from "types"
import { findFreeSlug } from "app/core/utils/findFreeSlug"

type UpdateScoreCardQuestionInput = Pick<Prisma.ScoreCardQuestionUpdateArgs, "where" | "data">

async function updateScoreCardQuestion({ where, data }: UpdateScoreCardQuestionInput, ctx: Ctx) {
  ctx.session.$authorize()

  const { order, behaviour } = ScoreCardQuestion.parse(data)

  const scoreCardQuestion = await db.scoreCardQuestion.update({
    where,
    data: {
      order,
      behaviour,
    },
  })

  return scoreCardQuestion
}

export default Guard.authorize("update", "scoreCardQuestion", updateScoreCardQuestion)
