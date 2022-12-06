import db from "db"

export default async function getCalendar(id: string) {
  const calendar = await db.calendar.findFirst({
    where: { id },
  })

  return calendar
}
