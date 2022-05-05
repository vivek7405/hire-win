import { Ctx } from "blitz"
import db, { Prisma } from "db"

type UpdateDefaultcalendarInput = Pick<Prisma.DefaultCalendarUpdateArgs, "where" | "data">

async function updateDefaultcalendar({ where, data }: UpdateDefaultcalendarInput, ctx: Ctx) {
  ctx.session.$authorize("ADMIN")

  const defaultcalendar = await db.defaultCalendar.update({
    where,
    data,
  })

  return defaultcalendar
}

export default updateDefaultcalendar
