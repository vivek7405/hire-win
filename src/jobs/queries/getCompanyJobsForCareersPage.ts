import { Ctx, paginate } from "blitz"
import db, { Prisma } from "db"
import Guard from "src/guard/ability"
import { JobViewType, PlanName } from "types"
import moment from "moment"
import getCurrentCompanyOwnerActivePlan from "src/plans/queries/getCurrentCompanyOwnerActivePlan"
import { FREE_CANDIDATES_LIMIT, LIFETIMET1_CANDIDATES_LIMIT } from "src/plans/constants"

interface GetJobsInput extends Pick<Prisma.JobUserFindManyArgs, "orderBy" | "skip" | "take"> {}

async function getCompanyJobsForCareersPage(
  {
    orderBy,
    skip = 0,
    take = 100,
    categoryId,
    searchString,
    companyId,
  }: GetJobsInput & {
    searchString: string
    categoryId: string | null
    companyId: string | null
  },
  ctx: Ctx
) {
  // ctx.session.$authorize()

  // const validThrough = { gte: moment().utc().toDate() }

  const companyJobs = await db.job.findMany({
    where: {
      companyId: companyId || "0",
    },
    include: {
      _count: { select: { candidates: true } },
    },
  })

  const activePlanName = await getCurrentCompanyOwnerActivePlan({}, ctx)

  let jobIdsWhereCandidateLimitReached: string[] = []
  if (activePlanName === PlanName.FREE) {
    jobIdsWhereCandidateLimitReached = companyJobs
      ?.filter((job) => job._count.candidates >= FREE_CANDIDATES_LIMIT)
      ?.map((job) => job.id)
  } else if (activePlanName === PlanName.LIFETIMET1) {
    jobIdsWhereCandidateLimitReached = companyJobs
      ?.filter((job) => job._count.candidates >= LIFETIMET1_CANDIDATES_LIMIT)
      ?.map((job) => job.id)
  }

  const where = {
    id: { notIn: jobIdsWhereCandidateLimitReached },
    archived: false,
    hidden: false,
    // validThrough,
    companyId: companyId || "0",
    categoryId: categoryId || {},
    title: {
      contains: JSON.parse(searchString),
      mode: "insensitive",
    },
  } as any

  const {
    items: jobs,
    hasMore,
    count,
  } = await paginate({
    skip,
    take,
    count: () => db.job.count({ where }),
    query: (paginateArgs) =>
      db.job.findMany({
        ...paginateArgs,
        where,
        orderBy,
        include: {
          category: true,
          stages: true,
        },
      }),
  })

  return {
    jobs,
    hasMore,
    count,
  }
}

export default getCompanyJobsForCareersPage
