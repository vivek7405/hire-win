import { Ctx } from "blitz"
import db, { Prisma } from "db"

type UpdateScorecardquestionInput = Pick<Prisma.ScoreCardQuestionUpdateArgs, "where" | "data">

async function updateScorecardquestion({ where, data }: UpdateScorecardquestionInput, ctx: Ctx) {
  ctx.session.$authorize("ADMIN")

  const scorecardquestion = await db.scoreCardQuestion.update({
    where,
    data,
  })

  return scorecardquestion
}

export default updateScorecardquestion
