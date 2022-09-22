import Guard from "app/guard/ability"
import { resolver, NotFoundError } from "blitz"
import db, { Prisma } from "db"
import { z } from "zod"

// const GetStage = z.object({
//   // This accepts type of undefined, but is required at runtime
//   slug: z.string().optional().refine(Boolean, "Required"),
// })

interface GetStageInput extends Pick<Prisma.StageFindFirstArgs, "where"> {}

const getStage = resolver.pipe(resolver.authorize(), async ({ where }: GetStageInput, ctx) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const stage = await db.stage.findFirst({
    where,
    include: {
      scoreCardQuestions: { include: { scores: { include: { candidate: true } }, stage: true } },
      scores: true,
      interviewer: { include: { calendars: true } },
      stageUserScheduleCalendars: { include: { schedule: true, calendar: true } },
    },
  })

  if (!stage) throw new NotFoundError()

  return stage
})

export default getStage
