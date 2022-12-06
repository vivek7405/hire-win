import db from "db"
import { Ctx } from "blitz"

type UpdateCalendarNameInputProps = {
  calendarId: string
  calendarName: string
}
export default async function updateCalendarName(
  { calendarId, calendarName }: UpdateCalendarNameInputProps,
  ctx: Ctx
) {
  ctx.session.$authorize()

  const updatedCalendar = await db.calendar.update({
    where: { id: calendarId },
    data: { name: calendarName },
  })

  return updatedCalendar
}
