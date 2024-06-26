import { resolver } from "@blitzjs/rpc"
import db, { CalendarType } from "db"
import passwordEncryptor from "src/core/utils/password-encryptor"
import { verifyConnectionDetails } from "src/calendars/caldav"
import * as z from "zod"
import slugify from "slugify"

export default resolver.pipe(
  resolver.zod(
    z.object({
      name: z.string(),
      url: z.string(),
      type: z.nativeEnum(CalendarType),
      username: z.string(),
      password: z.string(),
    })
  ),
  resolver.authorize(),
  async (calendarCreate, ctx) => {
    const { fail, connectionDetails } = await verifyConnectionDetails(
      calendarCreate.url,
      calendarCreate.username,
      calendarCreate.password,
      process.env.MODE === "DEVELOPMENT" ? true : false
    )

    if (fail) {
      return { fail }
    }

    const encryptedPassword = await passwordEncryptor.encrypt(calendarCreate.password)

    const slug = slugify(calendarCreate.name, { strict: true, lower: true })

    const calendar = await db.calendar.create({
      data: {
        name: calendarCreate.name,
        slug,
        caldavAddress: calendarCreate.url,
        type:
          calendarCreate.type === "CaldavDigest" || calendarCreate.type === "CaldavBasic"
            ? connectionDetails?.auth?.digest
              ? "CaldavDigest"
              : "CaldavBasic"
            : calendarCreate.type,
        username: calendarCreate.username,
        encryptedPassword,
        user: {
          connect: { id: ctx.session.userId },
        },
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

    return { fail: null }
  }
)
