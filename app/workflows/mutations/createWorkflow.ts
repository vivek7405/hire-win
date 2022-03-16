import { Ctx, AuthenticationError } from "blitz"
import db from "db"
import slugify from "slugify"
import { Workflow, WorkflowInputType } from "app/workflows/validations"
import Guard from "app/guard/ability"
import { findFreeSlug } from "app/core/utils/findFreeSlug"
import createWorkflowWithFactoryWorkflowStages from "./createWorkflowWithFactoryWorkflowStages"

async function createWorkflow(data: WorkflowInputType, ctx: Ctx) {
  ctx.session.$authorize()

  const { name } = Workflow.parse(data)
  const user = await db.user.findFirst({ where: { id: ctx.session.userId! } })
  if (!user) throw new AuthenticationError()

  // const slug = slugify(name, { strict: true })
  // const newSlug = await findFreeSlug(
  //   slug,
  //   async (e) => await db.workflow.findFirst({ where: { slug: e } })
  // )

  // const workflow = await db.workflow.create({
  //   data: {
  //     name: name,
  //     slug: newSlug,
  //     userId: user.id,
  //   },
  // })

  const workflow = await createWorkflowWithFactoryWorkflowStages(name, user.id)

  return workflow
}

export default Guard.authorize("create", "workflow", createWorkflow)
