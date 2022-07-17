import { Ctx, AuthenticationError } from "blitz"
import db from "db"
import slugify from "slugify"
import { WorkflowObj, WorkflowInputType } from "app/workflows/validations"
import Guard from "app/guard/ability"
import { findFreeSlug } from "app/core/utils/findFreeSlug"
import createWorkflowWithFactoryWorkflowStages from "./createWorkflowWithFactoryWorkflowStages"

async function createWorkflow(data: WorkflowInputType, ctx: Ctx) {
  ctx.session.$authorize()

  const { name } = WorkflowObj.parse(data)
  const company = await db.company.findFirst({ where: { id: ctx.session.companyId! } })
  if (!company) throw new AuthenticationError()

  // const slug = slugify(name, { strict: true, lower: true })
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

  const workflow = await createWorkflowWithFactoryWorkflowStages(name, company.id, false)

  return workflow
}

export default Guard.authorize("create", "workflow", createWorkflow)
