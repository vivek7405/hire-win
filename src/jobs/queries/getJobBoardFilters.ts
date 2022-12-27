import { Ctx, paginate } from "blitz"
import db, { CompanyUserRole, EmploymentType, Prisma, RemoteOption } from "db"
import Guard from "src/guard/ability"
import { JobViewType, PlanName } from "types"
import moment from "moment"
import getCurrentCompanyOwnerActivePlan from "src/plans/queries/getCurrentCompanyOwnerActivePlan"
import { FREE_CANDIDATES_LIMIT } from "src/plans/constants"

interface GetJobsInput extends Pick<Prisma.JobUserFindManyArgs, "orderBy" | "skip" | "take"> {}

async function getJobBoardFilters(
  {
    userId,
  }: GetJobsInput & {
    userId: string
  },
  ctx: Ctx
) {
  const companyUsers = await db.companyUser.findMany({
    where: { userId },
    include: {
      company: {
        include: {
          jobs: {
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
    archived: false,
    hidden: false,
  } as any

  const jobs = await db.job.findMany({
    where,
    include: {
      company: { select: { id: true, name: true } },
      category: { select: { id: true, name: true } },
    },
  })

  const companies = jobs
    ?.map((job) => job.company)
    ?.filter((company) => company !== null && company?.name !== "")
    // Unique values
    ?.filter(
      (company, index, self) => self.findIndex((comp) => comp?.name === company?.name) === index
    )

  const categories = jobs
    ?.map((job) => job.category)
    ?.filter((category) => category !== null && category?.name !== "")
    // Unique values
    ?.filter(
      (category, index, self) => self.findIndex((cat) => cat?.name === category?.name) === index
    )

  const jobTypes = jobs
    ?.map((job) => job.employmentType)
    ?.filter((employmentType) => employmentType !== null)
    // Since employmentType is an array, convert it to string
    ?.map((employmentType) => employmentType?.join(" "))
    // Get Unique values
    ?.filter((employmentType, index, self) => self.indexOf(employmentType) == index)

  const jobLocations = jobs
    ?.filter((job) => job.city || job.state || job.country)
    ?.map((job) => `${job?.city},${job?.state},${job?.country}`)
    // Unique values
    ?.filter((location, index, self) => self.indexOf(location) == index)

  const remoteOptions = jobs
    ?.map((job) => job.remoteOption)
    ?.filter((remoteOption) => remoteOption !== null)
    // Unique values
    ?.filter((remoteOption, index, self) => self.indexOf(remoteOption) == index)

  return {
    companies,
    categories,
    jobTypes,
    jobLocations,
    remoteOptions,
  }
}

export default getJobBoardFilters
