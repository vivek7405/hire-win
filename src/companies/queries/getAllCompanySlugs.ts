import db from "db"

const getAllCompanySlugs = async () => {
  const companies = await db.company.findMany({ select: { slug: true } })
  return companies
}

export default getAllCompanySlugs
