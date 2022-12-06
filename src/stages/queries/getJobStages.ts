import { Ctx } from "blitz"
import db, { Prisma } from "db"
import Guard from "src/guard/ability"

interface GetJobStageInput extends Pick<Prisma.StageFindManyArgs, "where" | "orderBy"> {}

async function getJobStages(
  { where, orderBy, rejectedCount }: GetJobStageInput & { rejectedCount?: boolean },
  ctx: Ctx
) {
  ctx.session.$authorize()

  const workflowStages = db.stage.findMany({
    where,
    orderBy,
    include: {
      interviewer: true,
      scoreCardQuestions: { orderBy: { order: "asc" } },
      scores: true,
      candidates: { select: { rejected: true } },
    },
  })

  return workflowStages
}

export default getJobStages

// export default Guard.authorize("readAll", "workflowStage", getJobStages)
