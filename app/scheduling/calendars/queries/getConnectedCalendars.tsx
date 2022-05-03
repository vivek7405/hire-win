import db, { Prisma } from "db"
import { resolver } from "blitz"

interface GetCalendarsInput extends Pick<Prisma.ConnectedCalendarFindManyArgs, "where"> {}

export default resolver.pipe(resolver.authorize(), async ({ where }: GetCalendarsInput, ctx) => {
  return await db.connectedCalendar.findMany({
    where,
    select: {
      caldavAddress: true,
      id: true,
      name: true,
      ownerId: true,
      status: true,
      type: true,
      username: true,
      encryptedPassword: false,
      refreshToken: true,
    },
  })
})
