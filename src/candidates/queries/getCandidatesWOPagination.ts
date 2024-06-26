import { Ctx } from "blitz"
import db, { Prisma } from "db"
import Guard from "src/guard/ability"

interface GetCandidateInput extends Pick<Prisma.CandidateFindManyArgs, "where" | "orderBy"> {}

async function getCandidatesWOPagination({ where, orderBy }: GetCandidateInput, ctx: Ctx) {
  const candidates = db.candidate.findMany({
    where,
    orderBy,
    include: {
      job: {
        include: {
          formQuestions: { include: { options: true } },
          stages: true,
          // workflow: { include: { stages: { include: { stage: true } } } },
        },
      },
      stage: true,
      // workflowStage: { include: { stage: true } },
      answers: { include: { formQuestion: { include: { options: true } } } },
    },
  })

  return candidates
}

export default getCandidatesWOPagination
