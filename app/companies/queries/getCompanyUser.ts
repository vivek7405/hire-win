import Guard from "app/guard/ability"
import { Ctx, NotFoundError } from "blitz"
import db, { Prisma } from "db"

interface GetCompanyUserInput extends Pick<Prisma.CompanyUserFindFirstArgs, "where"> {}

async function getCompanyUser({ where }: GetCompanyUserInput, ctx: Ctx) {
  const companyUser = await db.companyUser.findFirst({
    where,
    include: { company: true },
  })

  if (!companyUser) throw new NotFoundError()

  return companyUser
}

export default getCompanyUser
