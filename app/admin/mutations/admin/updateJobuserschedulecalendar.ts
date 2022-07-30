import { Ctx } from "blitz"
import db, { Prisma } from "db"

type UpdateJobuserschedulecalendarInput = Pick<
  Prisma.JobUserScheduleCalendarUpdateArgs,
  "where" | "data"
>

async function updateJobuserschedulecalendar(
  { where, data }: UpdateJobuserschedulecalendarInput,
  ctx: Ctx
) {
  ctx.session.$authorize("ADMIN")

  const jobuserschedulecalendar = await db.jobUserScheduleCalendar.update({
    where,
    data,
  })

  return jobuserschedulecalendar
}

export default updateJobuserschedulecalendar
