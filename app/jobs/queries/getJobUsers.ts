import { Ctx, NotFoundError } from "blitz"
import db, { Prisma } from "db"

interface GetJobUsersInput extends Pick<Prisma.JobUserFindManyArgs, "where"> {}

async function getJobUsers({ where }: GetJobUsersInput, ctx: Ctx) {
  const jobUsers = await db.jobUser.findMany({
    where,
    include: { job: true, user: true },
  })

  if (!jobUsers) throw new NotFoundError()

  return jobUsers
}

export default getJobUsers
