import db from "db"

export default async function getCalendar(id: number) {
  const calendar = await db.calendar.findFirst({
    where: { id: id },
  })

  return calendar
}
