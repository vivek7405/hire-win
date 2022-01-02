import { Ctx } from "blitz"
import db, { Prisma } from "db"
import { Workflow } from "app/workflows/validations"
import slugify from "slugify"
import Guard from "app/guard/ability"
import { ExtendedWorkflow } from "types"
import { findFreeSlug } from "app/core/utils/findFreeSlug"

type UpdateWorkflowInput = Pick<Prisma.WorkflowUpdateArgs, "where" | "data"> & {
  initial: ExtendedWorkflow
}

async function updateWorkflow({ where, data, initial }: UpdateWorkflowInput, ctx: Ctx) {
  ctx.session.$authorize()

  const { name } = Workflow.parse(data)

  const slug = slugify(name, { strict: true })
  const newSlug: string = await findFreeSlug(
    slug,
    async (e) => await db.workflow.findFirst({ where: { slug: e } })
  )

  const workflow = await db.workflow.update({
    where,
    data: {
      name,
      slug: initial.name !== name ? newSlug : initial.slug,
    },
  })

  return workflow
}

export default Guard.authorize("update", "workflow", updateWorkflow)