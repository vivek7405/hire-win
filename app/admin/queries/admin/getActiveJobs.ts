import { resolver } from "blitz"
import db from "db"

export default resolver.pipe(resolver.authorize("ADMIN"), async () => {
  const counter = db.job.count({
    where: {
      validThrough: {
        gte: new Date(),
      },
    },
  })

  return counter
})
