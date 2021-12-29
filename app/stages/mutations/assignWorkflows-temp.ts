import { Ctx, AuthenticationError } from "blitz"
import db, { Prisma } from "db"
import slugify from "slugify"
import { Stage, StageInputType } from "app/stages/validations"
import Guard from "app/guard/ability"
import { findFreeSlug } from "app/core/utils/findFreeSlug"
import { ExtendedStage } from "types"

type UpdateStageInput = Pick<Prisma.StageUpdateArgs, "where" | "data"> & {
  initial: ExtendedStage
}

async function assignWorkflows({ where, data, initial }: UpdateStageInput, ctx: Ctx) {
  ctx.session.$authorize()

  const { name, order, workflow } = Stage.parse(data)
  const user = await db.user.findFirst({ where: { id: ctx.session.userId! } })
  if (!user) throw new AuthenticationError()

  const slug = slugify(name, { strict: true })
  const newSlug = await findFreeSlug(
    slug,
    async (e) => await db.stage.findFirst({ where: { slug: e } })
  )

  const stage = await db.stage.update({
    where,
    data: {
      name: name,
      slug: newSlug,
      userId: user.id,
      workflows: {
        create: [
          {
            order: order!,
            workflow: {
              connect: {
                id: workflow,
              },
            },
            user: {
              connect: {
                id: user.id,
              },
            },
          },
        ],
      },
    },
  })

  return stage
}

export default Guard.authorize("update", "stage", assignWorkflows)
