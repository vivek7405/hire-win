import { Ctx, AuthenticationError } from "blitz"
import db from "db"
import { ScoreCardQuestions, ScoreCardQuestionsInputType } from "app/score-cards/validations"
import Guard from "app/guard/ability"
import factoryScoreCardQuestions from "app/card-questions/utils/factoryScoreCardQuestions"
import { CardQuestion, CardQuestionInputType } from "app/card-questions/validations"
import createQuestion from "app/card-questions/mutations/createCardQuestion"
import slugify from "slugify"
import { findFreeSlug } from "app/core/utils/findFreeSlug"
import shiftScoreCardQuestion from "./shiftScoreCardQuestion"
import { ShiftDirection } from "types"
import createScoreCardQuestion from "./createScoreCardQuestion"

async function addNewCardQuestionToScoreCard(data: CardQuestionInputType, ctx: Ctx) {
  ctx.session.$authorize()

  const { scoreCardId, name } = CardQuestion.parse(data)
  const user = await db.user.findFirst({ where: { id: ctx.session.userId! } })
  if (!user) throw new AuthenticationError()

  const cardQuestion = await createQuestion(data, ctx)
  const scoreCardQuestion = await createScoreCardQuestion(
    { scoreCardId, cardQuestionId: cardQuestion.id },
    ctx
  )

  return scoreCardQuestion
}

export default Guard.authorize("create", "scoreCardQuestion", addNewCardQuestionToScoreCard)
