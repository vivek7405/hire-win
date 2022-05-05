import { Ctx } from "blitz"
import db, { Prisma } from "db"

type UpdateBookingInput = Pick<Prisma.BookingUpdateArgs, "where" | "data">

async function updateBooking({ where, data }: UpdateBookingInput, ctx: Ctx) {
  ctx.session.$authorize("ADMIN")

  const booking = await db.booking.update({
    where,
    data,
  })

  return booking
}

export default updateBooking
