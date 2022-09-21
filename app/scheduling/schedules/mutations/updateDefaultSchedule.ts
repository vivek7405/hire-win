import db from "db"
import { Ctx } from "blitz"

export default async function updateDefaultSchedule(scheduleId: string, ctx: Ctx) {
  ctx.session.$authorize()

  const owner = await db.user.findFirst({
    where: { id: ctx.session.userId },
  })
  const defaultSchedule = await db.defaultSchedule.findFirst({
    where: { userId: ctx.session.userId },
  })

  if (!owner) {
    throw new Error("Invariant error: Owner does not exist")
  }

  if (!defaultSchedule) {
    await db.defaultSchedule.create({
      data: {
        user: {
          connect: { id: owner.id },
        },
        schedule: {
          connect: { id: scheduleId },
        },
      },
    })
  } else {
    await db.defaultSchedule.update({
      where: { id: defaultSchedule.id },
      data: {
        schedule: {
          connect: { id: scheduleId },
        },
      },
    })
  }

  return defaultSchedule
}
