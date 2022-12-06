import db from "db"
import { Ctx } from "blitz"

export default async function getDefaultScheduleByUser(_ = null, ctx: Ctx) {
  ctx.session.$authorize()

  const defaultSchedule = await db.defaultSchedule.findFirst({
    where: { userId: ctx.session!.userId },
  })

  if (!defaultSchedule) return null
  return defaultSchedule
}
