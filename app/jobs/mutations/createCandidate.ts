import { Ctx, resolver } from "blitz"
import db from "db"
import { Candidate, CandidateInputType } from "app/jobs/validations"

// Candidate can be created without authentication
async function createCandidate(data: CandidateInputType, ctx: Ctx) {
  const { answers, jobId, source } = Candidate.parse(data)

  const candidate = await db.candidate.create({
    data: {
      answers: {
        create: answers?.map((answer) => {
          return {
            value: answer.value,
            questionId: answer.questionId!,
          }
        }),
      },
      jobId: jobId!,
      source,
    },
  })

  return candidate
}

export default resolver.pipe(resolver.zod(Candidate), createCandidate)
