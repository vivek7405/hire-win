import { Ctx, paginate } from "blitz"
import db, { CompanyUserRole, JobType, Prisma, RemoteOption } from "db"
import Guard from "src/guard/ability"
import { JobViewType, PlanName } from "types"
import moment from "moment"
import getCurrentCompanyOwnerActivePlan from "src/plans/queries/getCurrentCompanyOwnerActivePlan"
import { FREE_CANDIDATES_LIMIT } from "src/plans/constants"
import getJobFilters from "../utils/getJobFilters"

async function getJobBoardFilters({ slug }, ctx: Ctx) {
  const parentCompany = await db.parentCompany.findFirst({
    where: { slug },
  })
  const companyUsers = await db.companyUser.findMany({
    where: { role: CompanyUserRole.OWNER, company: { parentCompanyId: parentCompany?.id || "0" } },
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

  return getJobFilters(jobs)
}

export default getJobBoardFilters
