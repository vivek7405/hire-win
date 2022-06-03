import { Ctx } from "blitz"
import db, { Prisma, Stage } from "db"
import { StageObj } from "app/stages/validations"
import slugify from "slugify"
import Guard from "app/guard/ability"
import { ExtendedStage } from "types"
import { findFreeSlug } from "app/core/utils/findFreeSlug"

type UpdateStageInput = Pick<Prisma.StageUpdateArgs, "where" | "data"> & {
  initial: Stage
}

async function updateStage({ where, data, initial }: UpdateStageInput, ctx: Ctx) {
  ctx.session.$authorize()

  const { name } = StageObj.parse(data)

  const slug = slugify(name, { strict: true })
  const newSlug: string = await findFreeSlug(
    slug,
    async (e) => await db.stage.findFirst({ where: { slug: e } })
  )

  const stage = await db.stage.update({
    where,
    data: {
      name,
      slug: initial.name !== name ? newSlug : initial.slug,
    },
  })

  return stage
}

export default Guard.authorize("update", "stage", updateStage)
