import { Ctx, paginate } from "blitz"
import db, { CompanyUserRole, JobType, Prisma, RemoteOption } from "db"
import Guard from "src/guard/ability"
import { JobViewType, PlanName } from "types"
import moment from "moment"
import getCurrentCompanyOwnerActivePlan from "src/plans/queries/getCurrentCompanyOwnerActivePlan"
import { FREE_CANDIDATES_LIMIT } from "src/plans/constants"
import getJobFilters from "../utils/getJobFilters"

async function getCareersPageFilters({ companyId }, ctx: Ctx) {
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
  }
  // else if (activePlanName === PlanName.LIFETIME_SET1) {
  //   jobIdsWhereCandidateLimitReached = companyJobs
  //     ?.filter((job) => job._count.candidates >= LIFETIME_SET1_CANDIDATES_LIMIT)
  //     ?.map((job) => job.id)
  // }

  const jobIdsToConsider = companyJobs
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

  // const companies = jobs
  //   ?.map((job) => job.company)
  //   ?.filter((company) => company !== null && company?.name !== "")
  //   // Unique values
  //   ?.filter(
  //     (company, index, self) => self.findIndex((comp) => comp?.name === company?.name) === index
  //   )

  // const categories = jobs
  //   ?.map((job) => job.category)
  //   ?.filter((category) => category !== null && category?.name !== "")
  //   // Unique values
  //   ?.filter(
  //     (category, index, self) => self.findIndex((cat) => cat?.name === category?.name) === index
  //   )

  // const jobTypes = jobs
  //   ?.map((job) => job.jobType)
  //   ?.filter((jobType) => jobType !== null)
  //   // Get Unique values
  //   ?.filter((jobType, index, self) => self.indexOf(jobType) == index)

  // const jobLocations = jobs
  //   ?.filter((job) => job.city || job.state || job.country)
  //   ?.map((job) => `${job?.city},${job?.state},${job?.country}`)
  //   // Unique values
  //   ?.filter((location, index, self) => self.indexOf(location) == index)

  // const remoteOptions = jobs
  //   ?.map((job) => job.remoteOption)
  //   ?.filter((remoteOption) => remoteOption !== null)
  //   // Unique values
  //   ?.filter((remoteOption, index, self) => self.indexOf(remoteOption) == index)

  // return {
  //   companies,
  //   categories,
  //   jobTypes,
  //   jobLocations,
  //   remoteOptions,
  // }

  return getJobFilters(jobs)
}

export default getCareersPageFilters
