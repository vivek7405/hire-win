import { Ctx } from "blitz"
import db, { Prisma } from "db"

type UpdateScoreInput = Pick<Prisma.ScoreUpdateArgs, "where" | "data">

async function updateScore({ where, data }: UpdateScoreInput, ctx: Ctx) {
  ctx.session.$authorize("ADMIN")

  const score = await db.score.update({
    where,
    data,
  })

  return score
}

export default updateScore
