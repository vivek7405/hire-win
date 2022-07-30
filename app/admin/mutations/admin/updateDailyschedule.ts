import { Ctx } from "blitz"
import db, { Prisma } from "db"

type UpdateDailyscheduleInput = Pick<Prisma.DailyScheduleUpdateArgs, "where" | "data">

async function updateDailyschedule({ where, data }: UpdateDailyscheduleInput, ctx: Ctx) {
  ctx.session.$authorize("ADMIN")

  const dailyschedule = await db.dailySchedule.update({
    where,
    data,
  })

  return dailyschedule
}

export default updateDailyschedule
