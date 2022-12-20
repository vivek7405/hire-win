import { Ctx, NotFoundError } from "blitz"
import db, { Prisma } from "db"

type GetActiveJobsCountInputType = {
  companyId: string
}
async function getActiveJobsCount({ companyId }: GetActiveJobsCountInputType, ctx: Ctx) {
  const activeJobsCount = await db.jobUser.count({
    where: {
      job: { companyId, archived: false },
    },
  })

  return activeJobsCount
}

export default getActiveJobsCount
