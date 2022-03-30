import Guard from "app/guard/ability"
import { paginate, resolver } from "blitz"
import db, { Prisma } from "db"

interface GetCandidatesInput
  extends Pick<Prisma.CandidateFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

const getCandidates = resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetCandidatesInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: candidates,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.candidate.count({ where }),
      query: (paginateArgs) =>
        db.candidate.findMany({
          ...paginateArgs,
          where,
          orderBy,
          include: {
            job: {
              include: {
                form: {
                  include: { questions: { include: { question: { include: { options: true } } } } },
                },
                workflow: { include: { stages: { include: { stage: true } } } },
              },
            },
            workflowStage: { include: { stage: true } },
            answers: { include: { question: { include: { options: true } } } },
          },
        }),
    })

    return {
      candidates,
      nextPage,
      hasMore,
      count,
    }
  }
)

export default Guard.authorize("readAll", "candidate", getCandidates)
