import Guard from "app/guard/ability"
import { checkPlan } from "app/users/utils/checkPlan"
import { Ctx, NotFoundError } from "blitz"
import db, { Company, CompanyUser, Prisma, User } from "db"
import { Plan } from "types"

interface GetCompanyUsersInput extends Pick<Prisma.CompanyUserFindManyArgs, "where"> {}

async function getCompanyUsers({ where }: GetCompanyUsersInput, ctx: Ctx) {
  const companyUsers = (await db.companyUser.findMany({
    where,
    include: { company: true, user: true },
  })) as any

  companyUsers.forEach((cu) => {
    cu.currentPlan = checkPlan(cu.company)
  })

  // if (!companyUsers) throw new NotFoundError()

  return companyUsers as (CompanyUser & {
    user: User
    company: Company
    currentPlan: Plan | null
  })[]
}

export default getCompanyUsers
