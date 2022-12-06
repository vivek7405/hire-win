import { resolver } from "@blitzjs/rpc";
import db from "db"
import * as z from "zod"
import slugify from "slugify"

export default resolver.pipe(
  resolver.zod(
    z.object({
      name: z.string(),
      refreshToken: z.string(),
    })
  ),
  resolver.authorize(),
  async ({ name, refreshToken }, ctx) => {
    const slug = slugify(name, { strict: true, lower: true })
    const calendar = await db.calendar.create({
      data: {
        name: name,
        slug,
        user: {
          connect: { id: ctx.session.userId },
        },
        type: "OutlookCalendar",
        refreshToken: refreshToken,
      },
    })

    const defaultCalendar = await db.defaultCalendar.findFirst({
      where: { userId: ctx.session.userId },
    })

    if (!defaultCalendar) {
      await db.defaultCalendar.create({
        data: {
          user: {
            connect: { id: ctx.session.userId },
          },
          calendar: {
            connect: { id: calendar.id },
          },
        },
      })
    }
  }
)
