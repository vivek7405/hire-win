import { Ctx } from "blitz"
import db, { Prisma } from "db"
import Guard from "app/guard/ability"

interface GetCandidateInput extends Pick<Prisma.CandidateFindManyArgs, "where" | "orderBy"> {}

async function getCandidatesWOPagination({ where, orderBy }: GetCandidateInput, ctx: Ctx) {
  const candidates = db.candidate.findMany({
    where,
    orderBy,
    include: {
      job: {
        include: {
          form: { include: { questions: true } },
          workflow: { include: { stages: { include: { stage: true } } } },
        },
      },
      workflowStage: { include: { stage: true } },
      answers: { include: { question: { include: { options: true } } } },
    },
  })

  return candidates
}

export default getCandidatesWOPagination
