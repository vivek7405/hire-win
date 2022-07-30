import { Ctx } from "blitz"
import db, { Prisma } from "db"

type UpdateCalendarInput = Pick<Prisma.CalendarUpdateArgs, "where" | "data">

async function updateCalendar({ where, data }: UpdateCalendarInput, ctx: Ctx) {
  ctx.session.$authorize("ADMIN")

  const calendar = await db.calendar.update({
    where,
    data,
  })

  return calendar
}

export default updateCalendar
