import db from "db"
import { resolver } from "blitz"
import * as z from "zod"

export default resolver.pipe(
  resolver.zod(
    z.object({
      name: z.string(),
      refreshToken: z.string(),
    })
  ),
  resolver.authorize(),
  async ({ name, refreshToken }, ctx) => {
    await db.calendar.create({
      data: {
        name: name,
        owner: {
          connect: { id: ctx.session.userId },
        },
        type: "OutlookCalendar",
        refreshToken: refreshToken,
      },
    })
  }
)
