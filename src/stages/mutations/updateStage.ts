import { Ctx } from "blitz"
import db, { Prisma, Stage } from "db"
import { StageObj } from "src/stages/validations"
import slugify from "slugify"
import Guard from "src/guard/ability"
import { ExtendedStage } from "types"
import { findFreeSlug } from "src/core/utils/findFreeSlug"

type UpdateStageInput = Pick<Prisma.StageUpdateArgs, "where" | "data"> & {
  initial: Stage
}

async function updateStage({ where, data }: UpdateStageInput, ctx: Ctx) {
  ctx.session.$authorize()

  const { name } = StageObj.parse(data)

  const slug = slugify(name, { strict: true, lower: true })

  const stage = await db.stage.update({
    where,
    data: {
      name,
      slug,
    },
  })

  return stage
}

export default updateStage
