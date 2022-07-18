import db, { Prisma } from "db"
import { resolver } from "blitz"

interface GetCalendarsInput extends Pick<Prisma.CalendarFindManyArgs, "where"> {}

export default resolver.pipe(resolver.authorize(), async ({ where }: GetCalendarsInput, ctx) => {
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
})
