import { Ctx, AuthenticationError } from "blitz"
import db from "db"
import Guard from "app/guard/ability"
import { StageObj, StageInputType } from "app/stages/validations"
import slugify from "slugify"
import { findFreeSlug } from "app/core/utils/findFreeSlug"
import shiftJobStage from "./shiftJobStage"

async function addNewStageToJob(data: StageInputType, ctx: Ctx) {
  ctx.session.$authorize()

  const { jobId, name } = StageObj.parse(data)
  const user = await db.user.findFirst({
    where: { id: ctx.session.userId || "0" },
    include: { defaultCalendars: true, defaultSchedules: true },
  })
  if (!user) throw new AuthenticationError()

  const slug = slugify(name, { strict: true, lower: true })
  // const newSlug = await findFreeSlug(
  //   slug,
  //   async (e) => await db.stage.findFirst({ where: { slug: e } })
  // )

  const existingStage = await db.stage.findFirst({
    where: { slug, jobId },
  })
  if (existingStage) {
    throw new Error("Stage with that name already exists.")
  }

  const order = (await db.stage.count({ where: { jobId } })) + 1

  const stage = await db.stage.create({
    data: {
      jobId: jobId || "0",
      name,
      order,
      slug,
      interviewerId: ctx.session.userId,
      duration: 30,
      createdById: ctx.session.userId,
    },
  })

  await db.stageUserScheduleCalendar.create({
    data: {
      stageId: stage.id || "0",
      userId: user.id || "0",
      calendarId: user.defaultCalendars?.find((cal) => cal.userId === user.id)?.calendarId || null,
      scheduleId: user.defaultSchedules?.find((sch) => sch.userId === user.id)?.scheduleId || "0",
    },
  })

  await db.scoreCardQuestion.createMany({
    data: [
      {
        stageId: stage?.id || "0",
        title: "Overall Score",
        slug: "overall-score",
        order: 1,
        createdById: ctx.session.userId,
      },
    ],
  })

  // After adding stage to the last position, shift it up
  await shiftJobStage({ jobId: jobId || "0", sourceOrder: order, destOrder: order - 1 }, ctx)

  return stage
}

export default addNewStageToJob
