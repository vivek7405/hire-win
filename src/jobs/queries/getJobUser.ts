import { Ctx, NotFoundError } from "blitz"
import db, { Prisma } from "db"

interface GetJobUserInput extends Pick<Prisma.JobUserFindFirstArgs, "where"> {}

async function getJobUser({ where }: GetJobUserInput, ctx: Ctx) {
  const jobUser = await db.jobUser.findFirst({
    where,
    include: { job: true, user: true },
  })

  if (!jobUser) throw new NotFoundError()

  return jobUser
}

export default getJobUser
