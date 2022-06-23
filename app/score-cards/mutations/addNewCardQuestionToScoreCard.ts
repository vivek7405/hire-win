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
  // const user = await db.user.findFirst({ where: { id: ctx.session.userId! } })
  // if (!user) throw new AuthenticationError()

  const slug = slugify(name, { strict: true })
  const newSlug = await findFreeSlug(
    slug,
    async (e) => await db.cardQuestion.findFirst({ where: { slug: e } })
  )

  const existingCardQuestion = await db.cardQuestion.findFirst({
    where: { name, companyId: ctx.session.companyId || 0 },
  })
  const order = (await db.scoreCardQuestion.count({ where: { scoreCardId: scoreCardId } })) + 1

  // Add New or connect existing cardQuestion and put it to the last position
  const scoreCard = await db.scoreCard.update({
    where: { id: scoreCardId },
    data: {
      cardQuestions: {
        create: [
          {
            createdAt: new Date(),
            updatedAt: new Date(),
            order,
            cardQuestion: {
              connectOrCreate: {
                where: { id: existingCardQuestion?.id || "" },
                create: {
                  name,
                  slug: newSlug,
                  company: {
                    connect: {
                      id: ctx.session.companyId || 0,
                    },
                  },
                },
              },
            },
          },
        ],
      },
    },
  })

  return scoreCard
}

export default Guard.authorize("create", "scoreCardQuestion", addNewCardQuestionToScoreCard)
