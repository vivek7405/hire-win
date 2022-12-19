import { resolver } from "@blitzjs/rpc"
import Guard from "src/guard/ability"
import { Ctx } from "blitz"
import db, { Prisma } from "db"
import moment from "moment"
import { JobViewType, PlanName } from "types"
import getCurrentCompanyOwnerActivePlan from "src/plans/queries/getCurrentCompanyOwnerActivePlan"
import { FREE_CANDIDATES_LIMIT, LIFETIMET1_CANDIDATES_LIMIT } from "src/plans/constants"

// interface GetCategoriesInput extends Pick<Prisma.CategoryFindManyArgs, "where"> {}

type GetCategoriesInput = {
  searchString: string
  companyId: string | null
}
const getCompanyJobCategoriesForFilter = async (
  { searchString, companyId }: GetCategoriesInput,
  ctx: Ctx
) => {
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

  const categories = await db.category.findMany({
    where: {
      companyId: companyId || "0",
      jobs: {
        some: {
          id: { notIn: jobIdsWhereCandidateLimitReached },
          archived: false,
          hidden: false,
          // validThrough,
          title: {
            contains: JSON.parse(searchString),
            mode: "insensitive",
          },
        },
      },
    },
    include: {
      jobs: {
        select: {
          id: true,
        },
      },
    },
    orderBy: { name: "asc" },
  })
  return categories
}

export default getCompanyJobCategoriesForFilter
