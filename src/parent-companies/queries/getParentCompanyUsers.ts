import { Ctx, NotFoundError } from "blitz"
import db, { Prisma } from "db"

interface GetParentCompanyUsersInput extends Pick<Prisma.ParentCompanyUserFindManyArgs, "where"> {}

async function getParentCompanyUsers({ where }: GetParentCompanyUsersInput, ctx: Ctx) {
  const parentCompanyUsers = await db.parentCompanyUser.findMany({
    where,
    include: { parentCompany: true, user: true },
  })

  if (!parentCompanyUsers) throw new NotFoundError()

  return parentCompanyUsers
}

export default getParentCompanyUsers
