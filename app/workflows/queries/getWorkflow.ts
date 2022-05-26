import Guard from "app/guard/ability"
import { resolver, NotFoundError, Ctx } from "blitz"
import db, { Prisma } from "db"
import { z } from "zod"

// const GetWorkflow = z.object({
//   // This accepts type of undefined, but is required at runtime
//   slug: z.string().optional().refine(Boolean, "Required"),
// })

interface GetWorkflowInput extends Pick<Prisma.WorkflowFindFirstArgs, "where"> {}

const getWorkflow = async ({ where }: GetWorkflowInput, ctx: Ctx) => {
  ctx.session.$authorize()

  const workflow = await db.workflow.findFirst({
    where,
    include: {
      stages: { include: { stage: true, scoreCards: { include: { scoreCard: true } } } },
    },
  })

  if (!workflow) throw new NotFoundError()

  return workflow
}

export default Guard.authorize("read", "workflow", getWorkflow)
