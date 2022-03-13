import { Ctx, AuthenticationError } from "blitz"
import db from "db"
import { WorkflowStages, WorkflowStagesInputType } from "app/workflows/validations"
import Guard from "app/guard/ability"
import factoryWorkflowStages from "app/stages/utils/factoryWorkflowStages"
import { Stage, StageInputType } from "app/stages/validations"
import createStage from "app/stages/mutations/createStage"
import slugify from "slugify"
import { findFreeSlug } from "app/core/utils/findFreeSlug"
import shiftWorkflowStage from "./shiftWorkflowStage"
import { ShiftDirection } from "types"

async function addNewStageToWorkflow(data: StageInputType, ctx: Ctx) {
  ctx.session.$authorize()

  const { workflowId, name } = Stage.parse(data)
  const user = await db.user.findFirst({ where: { id: ctx.session.userId! } })
  if (!user) throw new AuthenticationError()

  const slug = slugify(name, { strict: true })
  const newSlug = await findFreeSlug(
    slug,
    async (e) => await db.stage.findFirst({ where: { slug: e } })
  )

  const existingStage = await db.stage.findFirst({ where: { name } })
  const order = (await db.workflowStage.count({ where: { workflowId: workflowId } })) + 1

  // Add New or connect existing stage and put it to the last position
  const workflow = await db.workflow.update({
    where: { id: workflowId },
    data: {
      stages: {
        create: [
          {
            createdAt: new Date(),
            updatedAt: new Date(),
            order,
            stage: {
              connectOrCreate: {
                where: { id: existingStage?.id || "" },
                create: {
                  name,
                  slug: newSlug,
                  user: {
                    connect: {
                      id: user.id,
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

  // After adding stage to the last position, shift it up
  await shiftWorkflowStage(
    { workflowId: workflowId!, order, shiftDirection: ShiftDirection.UP },
    ctx
  )

  return workflow
}

export default Guard.authorize("create", "workflowStage", addNewStageToWorkflow)
