import Guard from "src/guard/ability"
import { Ctx, NotFoundError } from "blitz"
import db, { Prisma } from "db"

interface GetJobInput extends Pick<Prisma.JobFindFirstArgs, "where"> {}

async function getJobMembers({ where }: GetJobInput, ctx: Ctx) {
  const job = await db.job.findFirst({
    where,
    include: {
      users: {
        include: {
          user: true,
        },
      },
    },
  })

  if (!job) throw new NotFoundError()

  return job
}

export default getJobMembers
