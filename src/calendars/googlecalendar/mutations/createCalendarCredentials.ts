import { resolver } from "@blitzjs/rpc";
import db from "db"
import { createGoogleOauth } from "../helpers/GoogleClient"
import * as z from "zod"
import slugify from "slugify"

export default resolver.pipe(
  resolver.zod(
    z.object({
      name: z.string(),
      oauthCode: z.string(),
    })
  ),
  resolver.authorize(),
  async ({ name, oauthCode }, ctx) => {
    const oauth2Client = createGoogleOauth()
    const { tokens } = await oauth2Client.getToken(oauthCode)
    const slug = slugify(name, { strict: true, lower: true })

    const calendar = await db.calendar.create({
      data: {
        name: name,
        slug,
        user: {
          connect: { id: ctx.session.userId || "0" },
        },
        type: "GoogleCalendar",
        refreshToken: tokens.refresh_token,
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
