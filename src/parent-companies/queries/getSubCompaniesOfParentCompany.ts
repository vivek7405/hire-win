import { Ctx, NotFoundError } from "blitz"
import db, { Prisma } from "db"

type GetSubCompaniesOfParentCompanyInput = {
  parentCompanyId: string
}

async function getSubCompaniesOfParentCompany(
  { parentCompanyId }: GetSubCompaniesOfParentCompanyInput,
  ctx: Ctx
) {
  const companies = await db.company.findMany({
    where: { parentCompanyId: parentCompanyId || "0" },
    include: { createdBy: true },
  })

  return companies
}

export default getSubCompaniesOfParentCompany
