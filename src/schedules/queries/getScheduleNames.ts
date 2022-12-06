import { resolver } from "@blitzjs/rpc";
import db from "db"

export default resolver.pipe(resolver.authorize(), async (_ = null, ctx) => {
  return await db.schedule.findMany({
    where: {
      userId: ctx.session.userId,
    },
    select: { id: true, timezone: true, name: true },
  })
})
