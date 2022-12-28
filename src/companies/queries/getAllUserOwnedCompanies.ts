import { Ctx } from "@blitzjs/next"
import db, { CompanyUserRole } from "db"

type GetAllUserOwnedCompaniesInput = {
  userId: string
}
const getAllUserOwnedCompanies = async ({ userId }: GetAllUserOwnedCompaniesInput, ctx: Ctx) => {
  const companies = await db.company.findMany({
    where: {
      users: {
        some: {
          id: userId,
          role: CompanyUserRole.OWNER,
        },
      },
    },
  })

  return companies
}

export default getAllUserOwnedCompanies
