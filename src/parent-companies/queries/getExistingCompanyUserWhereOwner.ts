import { Ctx } from "blitz"
import db, { CompanyUserRole } from "db"

async function getExistingCompanyUserWhereOwner({}, ctx: Ctx) {
  const parentCompany = await db.companyUser.findFirst({
    where: { userId: ctx?.session?.userId || "0", role: CompanyUserRole.OWNER },
    include: { company: true },
  })

  return parentCompany
}

export default getExistingCompanyUserWhereOwner
