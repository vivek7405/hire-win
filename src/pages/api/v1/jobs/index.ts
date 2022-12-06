import { NextApiHandler } from "next"
import { checkToken } from "src/core/utils/checkToken"
import db from "db"

const handler = async (req, res) => {
  const token = await checkToken(req, res, { PUBLIC: false })

  if (!token) {
    res.statusCode = 403
    res.setHeader("Content-Type", "application/json")
    res.end(JSON.stringify({ error: "Authentication Error" }))
  } else {
    if (req.method === "GET") {
      const jobs = await db.jobUser.findMany({
        include: {
          job: true,
        },
      })
      res.statusCode = 200
      res.setHeader("Content-Type", "application/json")
      res.end(JSON.stringify({ jobs }))
    }
  }
}
export default handler
