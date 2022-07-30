import { Ctx } from "blitz"
import db, { Prisma } from "db"

type UpdateScheduleInput = Pick<Prisma.ScheduleUpdateArgs, "where" | "data">

async function updateSchedule({ where, data }: UpdateScheduleInput, ctx: Ctx) {
  ctx.session.$authorize("ADMIN")

  const schedule = await db.schedule.update({
    where,
    data,
  })

  return schedule
}

export default updateSchedule
