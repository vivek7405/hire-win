import Guard from "app/guard/ability"
import { Ctx, NotFoundError } from "blitz"
import db, { Prisma } from "db"

interface GetCandidateInput extends Pick<Prisma.CandidateFindFirstArgs, "where"> {}

async function getCandidate({ where }: GetCandidateInput, ctx: Ctx) {
  const candidate = await db.candidate.findFirst({
    where,
    include: {
      job: {
        include: {
          // form: {
          //   include: { questions: { include: { question: { include: { options: true } } } } },
          // },
          formQuestions: { include: { options: true }, orderBy: { order: "asc" } },
          stages: {
            include: { interviewer: true, scoreCardQuestions: true, scores: true },
            orderBy: { order: "asc" },
          },
        },
      },
      stage: { include: { interviewer: true, scoreCardQuestions: true, scores: true } },
      answers: {
        include: { formQuestion: { include: { options: true } } },
      },
      scores: true,
    },
  })

  if (!candidate) throw new NotFoundError()

  return candidate
}

export default Guard.authorize("read", "candidate", getCandidate)
