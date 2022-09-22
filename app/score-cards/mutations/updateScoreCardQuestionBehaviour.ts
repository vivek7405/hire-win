import { Ctx } from "blitz"
import db, { Prisma } from "db"
import slugify from "slugify"
import Guard from "app/guard/ability"
import { ExtendedScoreCardQuestion } from "types"
import { findFreeSlug } from "app/core/utils/findFreeSlug"
import { ScoreCardQuestionObj } from "../validations"

type UpdateScoreCardQuestionInput = Pick<Prisma.ScoreCardQuestionUpdateArgs, "where" | "data">

async function updateScoreCardQuestionBehaviour(
  { where, data }: UpdateScoreCardQuestionInput,
  ctx: Ctx
) {
  ctx.session.$authorize()

  const { behaviour } = ScoreCardQuestionObj.parse(data)

  const scoreCardQuestion = await db.scoreCardQuestion.update({
    where,
    data: { behaviour },
  })

  return scoreCardQuestion
}

export default updateScoreCardQuestionBehaviour
