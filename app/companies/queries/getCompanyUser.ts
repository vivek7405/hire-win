import Guard from "app/guard/ability"
import { checkPlan } from "app/users/utils/checkPlan"
import { Ctx, NotFoundError } from "blitz"
import db, { Company, CompanyUser, Prisma, User } from "db"
import { Plan } from "types"

interface GetCompanyUserInput extends Pick<Prisma.CompanyUserFindFirstArgs, "where"> {}

async function getCompanyUser({ where }: GetCompanyUserInput, ctx: Ctx) {
  const companyUser = (await db.companyUser.findFirst({
    where,
    include: { company: true, user: true },
  })) as any

  if (companyUser && companyUser.company) {
    companyUser.currentPlan = checkPlan(companyUser.company)
  }

  // if (!companyUser) throw new NotFoundError()

  return companyUser as CompanyUser & {
    user: User
    company: Company
    currentPlan: Plan | null
  }
}

export default getCompanyUser
