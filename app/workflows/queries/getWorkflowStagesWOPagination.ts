import { Ctx } from "blitz"
import db, { Prisma } from "db"
import Guard from "app/guard/ability"

interface GetWorkflowStageInput
  extends Pick<Prisma.WorkflowStageFindManyArgs, "where" | "orderBy"> {}

async function getWorkflowStagesWOPagination({ where, orderBy }: GetWorkflowStageInput, ctx: Ctx) {
  ctx.session.$authorize()

  const workflowStages = db.workflowStage.findMany({
    where,
    orderBy,
    include: {
      stage: true,
    },
  })

  return workflowStages
}

export default Guard.authorize("readAll", "workflowStage", getWorkflowStagesWOPagination)
