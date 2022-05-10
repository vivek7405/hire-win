import Guard from "app/guard/ability"
import { Ctx, NotFoundError } from "blitz"
import db, { Prisma } from "db"

interface GetJobInput extends Pick<Prisma.JobFindFirstArgs, "where"> {}

async function getJob({ where }: GetJobInput, ctx: Ctx) {
  const job = await db.job.findFirst({
    where,
    include: {
      category: true,
      candidates: true,
      workflow: {
        include: {
          stages: {
            include: {
              stage: true,
              scoreCards: { include: { scoreCard: true } },
              interviewDetails: true,
            },
          },
        },
      },
      form: {
        include: {
          questions: {
            include: {
              question: true,
            },
            orderBy: {
              order: "asc",
            },
          },
        },
      },
      memberships: {
        include: {
          user: {
            include: {
              // id: true,
              // email: true,
              // role: true,
              // logo: true,
              memberships: true,
              sessions: true,
              tokens: true,
            },
          },
        },
      },
      scoreCards: { include: { scoreCard: true } },
      interviewDetails: true,
    },
  })

  if (!job) throw new NotFoundError()

  return job
}

export default getJob
