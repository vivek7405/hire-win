import db from "db"
import { resolver } from "blitz"
import * as z from "zod"

export default resolver.pipe(
  resolver.zod(z.number()),
  resolver.authorize(),
  async (calendarId, ctx) => {
    const calendar = await db.calendar.delete({
      where: { id: calendarId },
    })

    return calendar
  }
)
