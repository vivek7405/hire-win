import { Ctx, AuthenticationError } from "blitz"
import db from "db"
import slugify from "slugify"
import { StageObj, StageInputType } from "app/stages/validations"
import Guard from "app/guard/ability"
import { findFreeSlug } from "app/core/utils/findFreeSlug"

async function createStage(data: StageInputType, ctx: Ctx) {
  ctx.session.$authorize()

  const { name } = StageObj.parse(data)
  // const user = await db.user.findFirst({ where: { id: ctx.session.userId! } })
  // if (!user) throw new AuthenticationError()

  const slug = slugify(name, { strict: true })
  const newSlug = await findFreeSlug(
    slug,
    async (e) => await db.stage.findFirst({ where: { slug: e } })
  )

  const stage = await db.stage.create({
    data: {
      name: name,
      slug: newSlug,
      companyId: ctx.session.companyId || 0,
    },
  })

  return stage
}

export default Guard.authorize("create", "stage", createStage)
