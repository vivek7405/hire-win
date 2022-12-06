import { Ctx } from "blitz"
import db, { Prisma } from "db"

interface GetCalendarsInput extends Pick<Prisma.CalendarFindManyArgs, "where"> {}

async function getCalendars({ where }: GetCalendarsInput, ctx: Ctx) {
  return await db.calendar.findMany({
    where,
    select: {
      caldavAddress: true,
      id: true,
      name: true,
      userId: true,
      type: true,
      username: true,
      encryptedPassword: false,
      refreshToken: true,
    },
  })
}

export default getCalendars
