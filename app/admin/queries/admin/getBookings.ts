import { paginate, Ctx } from "blitz"
import db, { Prisma } from "db"

interface GetBookingsInput
  extends Pick<Prisma.BookingFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

async function getBookings({ where, orderBy, skip = 0, take = 100 }: GetBookingsInput, ctx: Ctx) {
  ctx.session.$authorize("ADMIN")

  const {
    items: bookings,
    hasMore,
    count,
  } = await paginate({
    skip,
    take,
    count: () => db.booking.count({ where }),
    query: (paginateArgs) =>
      db.booking.findMany({
        ...paginateArgs,
        where,
        orderBy,
      }),
  })

  return {
    bookings,
    hasMore,
    count,
  }
}

export default getBookings
