import { Ctx } from "blitz"
import db, { Prisma } from "db"

type UpdateStageInput = Pick<Prisma.StageUpdateArgs, "where" | "data">

async function updateStage({ where, data }: UpdateStageInput, ctx: Ctx) {
  ctx.session.$authorize("ADMIN")

  const stage = await db.stage.update({
    where,
    data,
  })

  return stage
}

export default updateStage
