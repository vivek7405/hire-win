import Guard from "app/guard/ability"
import { Ctx, NotFoundError } from "blitz"
import db, { Prisma } from "db"

interface GetCompanyUsersInput extends Pick<Prisma.CompanyUserFindManyArgs, "where"> {}

async function getCompanyUsers({ where }: GetCompanyUsersInput, ctx: Ctx) {
  const companyUsers = await db.companyUser.findMany({
    where,
    include: { company: true, user: true },
  })

  if (!companyUsers) throw new NotFoundError()

  return companyUsers
}

export default getCompanyUsers
