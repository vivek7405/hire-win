import { Ctx } from "blitz"
import db, { Prisma } from "db"

type UpdateScorecardInput = Pick<Prisma.ScoreCardUpdateArgs, "where" | "data">

async function updateScorecard({ where, data }: UpdateScorecardInput, ctx: Ctx) {
  ctx.session.$authorize("ADMIN")

  const scorecard = await db.scoreCard.update({
    where,
    data,
  })

  return scorecard
}

export default updateScorecard
