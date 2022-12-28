import { Ctx, paginate } from "blitz"
import db, { CompanyUserRole, JobType, Prisma, RemoteOption } from "db"
import Guard from "src/guard/ability"
import { JobViewType, PlanName } from "types"
import moment from "moment"
import getCurrentCompanyOwnerActivePlan from "src/plans/queries/getCurrentCompanyOwnerActivePlan"
import { FREE_CANDIDATES_LIMIT } from "src/plans/constants"

interface GetJobsInput extends Pick<Prisma.JobUserFindManyArgs, "orderBy" | "skip" | "take"> {}

async function getUserOwnedCompanyJobs(
  {
    orderBy,
    skip = 0,
    take = 100,
    companyId,
    categoryId,
    jobType,
    jobCountry,
    jobState,
    jobCity,
    remoteOption,
    searchString,
    userId,
  }: GetJobsInput & {
    companyId: string
    categoryId: string
    jobType: string
    jobCountry: string
    jobState: string
    jobCity: string
    remoteOption: string
    searchString: string
    userId: string
  },
  ctx: Ctx
) {
  // ctx.session.$authorize()

  // const validThrough = { gte: moment().utc().toDate() }

  //   const companyJobs = await db.job.findMany({
  //     where: {
  //       companyId: companyId || "0",
  //     },
  //     include: {
  //       _count: { select: { candidates: true } },
  //     },
  //   })

  let companyUsersWhere = {
    userId,
    role: CompanyUserRole.OWNER,
  }
  if (companyId) companyUsersWhere["companyId"] = companyId

  let jobsWhere = {
    archived: false,
    hidden: false,
    title: {
      contains: JSON.parse(searchString),
      mode: "insensitive",
    },
  } as any
  if (categoryId) jobsWhere["categoryId"] = categoryId
  if (jobType) jobsWhere["jobType"] = JobType[jobType]
  if (jobCountry) jobsWhere["country"] = jobCountry
  if (jobState) jobsWhere["state"] = jobState
  if (jobCity) jobsWhere["city"] = jobCity
  if (remoteOption) jobsWhere["remoteOption"] = RemoteOption[remoteOption]
  // categoryId,
  //   jobType: jobType ? JobType[jobType] : undefined,
  //   country: jobCountry,
  //   state: jobState,
  //   city: jobCity,
  //   remoteOption: remoteOption ? RemoteOption[remoteOption] : undefined,

  const companyUsers = await db.companyUser.findMany({
    where: companyUsersWhere,
    include: {
      company: {
        include: {
          jobs: {
            where: jobsWhere,
            include: {
              _count: { select: { candidates: true } },
            },
          },
        },
      },
    },
  })

  const userOwnedCompanyJobs = companyUsers.map((cu) => cu.company.jobs)?.flat()

  const activePlanName = await getCurrentCompanyOwnerActivePlan({}, ctx)

  let jobIdsWhereCandidateLimitReached: string[] = []
  if (activePlanName === PlanName.FREE) {
    jobIdsWhereCandidateLimitReached = userOwnedCompanyJobs
      ?.filter((job) => job._count.candidates >= FREE_CANDIDATES_LIMIT)
      ?.map((job) => job.id)
  }
  // else if (activePlanName === PlanName.LIFETIME_SET1) {
  //   jobIdsWhereCandidateLimitReached = companyJobs
  //     ?.filter((job) => job._count.candidates >= LIFETIME_SET1_CANDIDATES_LIMIT)
  //     ?.map((job) => job.id)
  // }

  const jobIdsToConsider = userOwnedCompanyJobs
    ?.map((job) => job.id)
    ?.filter((id) => !jobIdsWhereCandidateLimitReached?.includes(id))

  const where = {
    id: { in: jobIdsToConsider },
  }

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
          company: true,
        },
      }),
  })

  return {
    jobs,
    hasMore,
    count,
  }
}

export default getUserOwnedCompanyJobs
