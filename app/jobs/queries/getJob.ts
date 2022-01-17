import Guard from "app/guard/ability"
import { Ctx, NotFoundError } from "blitz"
import db, { Prisma } from "db"

interface GetJobInput extends Pick<Prisma.JobFindFirstArgs, "where"> {}

async function getJob({ where }: GetJobInput, ctx: Ctx) {
  const job = await db.job.findFirst({
    where,
    include: {
      category: true,
      workflow: true,
      form: {
        include: {
          questions: {
            include: {
              question: true,
            },
          },
        },
      },
      memberships: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
              avatar: true,
              memberships: true,
              sessions: true,
              tokens: true,
            },
          },
        },
      },
    },
  })

  if (!job) throw new NotFoundError()

  return job
}

export default getJob
