import { resolver } from "@blitzjs/rpc"
import Guard from "src/guard/ability"
import { paginate } from "blitz"
import db, { Prisma } from "db"

interface GetCandidatesInput
  extends Pick<Prisma.CandidateFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

const getCandidatesWOAbility = resolver.pipe(
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
                formQuestions: { include: { options: true } },
                stages: true,
                // workflow: { include: { stages: { include: { stage: true } } } },
              },
            },
            scores: true,
            stage: true,
            // workflowStage: { include: { stage: true } },
            answers: { include: { formQuestion: { include: { options: true } } } },
            createdBy: true,
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

export default getCandidatesWOAbility
