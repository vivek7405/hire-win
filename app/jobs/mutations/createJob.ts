import { Ctx, AuthenticationError } from "blitz"
import db from "db"
import slugify from "slugify"
import { Job, JobInputType } from "app/jobs/validations"
import Guard from "app/guard/ability"
import { findFreeSlug } from "app/core/utils/findFreeSlug"
import { MembershipRole, ScoreCard } from "@prisma/client"

async function createJob(data: JobInputType, ctx: Ctx) {
  ctx.session.$authorize()

  const {
    title,
    description,
    categoryId,
    workflowId,
    formId,
    country,
    state,
    city,
    remote,
    currency,
    minSalary,
    maxSalary,
    salaryType,
    employmentType,
    validThrough,
    scoreCards,
  } = Job.parse(data)

  const user = await db.user.findFirst({
    where: { id: ctx.session.userId! },
    include: { defaultCalendars: true, schedules: true },
  })
  if (!user) throw new AuthenticationError()

  const slug = slugify(title, { strict: true })
  const newSlug = await findFreeSlug(
    slug,
    async (e) => await db.job.findFirst({ where: { slug: e } })
  )

  const defaultScoreCard = await db.scoreCard.findFirst({
    where: { userId: user.id, name: "Default" },
  })

  const workflow = await db.workflow.findFirst({
    where: { id: workflowId },
    include: { stages: { include: { stage: true } } },
  })

  const job = await db.job.create({
    data: {
      title,
      slug: newSlug,
      description,
      categoryId: categoryId || null,
      workflowId: workflowId || null,
      formId: formId || null,
      country,
      state,
      city,
      remote,
      currency,
      minSalary,
      maxSalary,
      salaryType,
      employmentType,
      validThrough,
      memberships: {
        create: {
          role: MembershipRole.OWNER,
          user: {
            connect: {
              id: user.id,
            },
          },
        },
      },
      scoreCards: {
        createMany: {
          data: scoreCards?.map((scoreCardJobWorkflowStage) => {
            return {
              scoreCardId: scoreCardJobWorkflowStage?.scoreCardId,
              workflowStageId: scoreCardJobWorkflowStage?.workflowStageId!,
            }
          })!,
        },
      },
      interviewDetails: {
        createMany: {
          data:
            workflow?.stages?.map((ws) => {
              return {
                workflowStageId: ws.id || "",
                interviewerId: user.id || 0,
                calendarId:
                  user.defaultCalendars?.find((cal) => cal.userId === user.id)?.calendarId || null,
                scheduleId: user.schedules?.find((sch) => sch.name === "Default")?.id || 0,
                duration: 30,
              }
            }) || [],
        },
      },
    },
  })

  return job
}

export default Guard.authorize("create", "job", createJob)
