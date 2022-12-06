import { resolver } from "@blitzjs/rpc";
import db from "db"
import * as z from "zod"

export default resolver.pipe(
  resolver.zod(z.string()),
  resolver.authorize(),
  async (calendarId, ctx) => {
    const calendar = await db.calendar.delete({
      where: { id: calendarId },
    })

    return calendar
  }
)
