import { paginate, Ctx } from "blitz"
import db, { Prisma } from "db"

interface GetCandidateworkflowstageinterviewersInput
  extends Pick<
    Prisma.CandidateWorkflowStageInterviewerFindManyArgs,
    "where" | "orderBy" | "skip" | "take"
  > {}

async function getCandidateworkflowstageinterviewers(
  { where, orderBy, skip = 0, take = 100 }: GetCandidateworkflowstageinterviewersInput,
  ctx: Ctx
) {
  ctx.session.$authorize("ADMIN")

  const {
    items: candidateworkflowstageinterviewers,
    hasMore,
    count,
  } = await paginate({
    skip,
    take,
    count: () => db.candidateWorkflowStageInterviewer.count({ where }),
    query: (paginateArgs) =>
      db.candidateWorkflowStageInterviewer.findMany({
        ...paginateArgs,
        where,
        orderBy,
      }),
  })

  return {
    candidateworkflowstageinterviewers,
    hasMore,
    count,
  }
}

export default getCandidateworkflowstageinterviewers
