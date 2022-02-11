import db from "db"

const getAllUsersWOPagination = async () => {
  const users = await db.user.findMany()
  return users
}

export default getAllUsersWOPagination
