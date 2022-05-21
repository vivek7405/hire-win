import Guard from "app/guard/ability"
import { Ctx, NotFoundError } from "blitz"
import db, { Prisma } from "db"

interface GetCompanyInput extends Pick<Prisma.CompanyFindFirstArgs, "where"> {}

async function getCompany({ where }: GetCompanyInput, ctx: Ctx) {
  const company = await db.company.findFirst({
    where,
  })

  if (!company) throw new NotFoundError()

  return company
}

export default getCompany
