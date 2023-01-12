import { Ctx } from "blitz"
import db, { Prisma } from "db"

interface GetParentCompanyInput extends Pick<Prisma.ParentCompanyFindFirstArgs, "where"> {}

async function getParentCompany({ where }: GetParentCompanyInput, ctx: Ctx) {
  const parentCompany = await db.parentCompany.findFirst({
    where,
    include: {
      users: {
        include: {
          user: true,
        },
      },
    },
  })

  return parentCompany
}

export default getParentCompany
