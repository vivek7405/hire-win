import db from "db"

const getAllCompanies = async () => {
  const companies = await db.company.findMany()
  return companies
}

export default getAllCompanies
