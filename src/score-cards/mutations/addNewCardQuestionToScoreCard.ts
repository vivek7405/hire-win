import { Ctx } from "blitz";
import db from "db"
// import { ScoreCardQuestions, ScoreCardQuestionsInputType } from "src/score-cards/validations"
import Guard from "src/guard/ability"
import { ScoreCardQuestionInputType, ScoreCardQuestionObj } from "../validations"
import slugify from "slugify"
import { findFreeSlug } from "src/core/utils/findFreeSlug"
import shiftScoreCardQuestion from "./shiftScoreCardQuestion"
import { ShiftDirection } from "types"

async function addNewCardQuestionToScoreCard(data: ScoreCardQuestionInputType, ctx: Ctx) {
  ctx.session.$authorize()

  const { stageId, title } = ScoreCardQuestionObj.parse(data)
  // const user = await db.user.findFirst({ where: { id: ctx.session.userId! } })
  // if (!user) throw new AuthenticationError()

  const slug = slugify(title, { strict: true, lower: true })
  // const newSlug = await findFreeSlug(
  //   slug,
  //   async (e) => await db.cardQuestion.findFirst({ where: { slug: e } })
  // )

  // const existingCardQuestion = await db.cardQuestion.findFirst({
  //   where: { name, companyId: ctx.session.companyId || "0" },
  // })
  const order = (await db.scoreCardQuestion.count({ where: { stageId: stageId || "0" } })) + 1

  // Add New or connect existing cardQuestion and put it to the last position
  const scoreCardQuestion = await db.scoreCardQuestion.create({
    data: {
      stageId: stageId || "0",
      title,
      slug,
      order,
      createdById: ctx.session.userId || "0",
    },
  })

  return scoreCardQuestion
}

export default addNewCardQuestionToScoreCard
