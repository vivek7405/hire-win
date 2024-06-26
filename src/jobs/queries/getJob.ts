import Guard from "src/guard/ability"
import { Ctx, NotFoundError } from "blitz"
import db, { Prisma } from "db"

interface GetJobInput extends Pick<Prisma.JobFindFirstArgs, "where"> {}

async function getJob({ where }: GetJobInput, ctx: Ctx) {
  const job = await db.job.findFirst({
    where,
    include: {
      company: true,
      category: true,
      candidates: true,
      formQuestions: { include: { options: true }, orderBy: { order: "asc" } },
      stages: {
        include: {
          scoreCardQuestions: true,
          interviewer: true,
          // interviewDetails: true,
          stageUserScheduleCalendars: true,
        },
        orderBy: {
          order: "asc",
        },
      },
      // workflow: {
      //   include: {
      //     stages: {
      //       include: {
      //         stage: true,
      //         scoreCards: { include: { scoreCard: true } },
      //         interviewDetails: true,
      //         jobUserScheduleCalendars: true,
      //       },
      //       orderBy: {
      //         order: "asc",
      //       },
      //     },
      //   },
      // },
      // form: {
      //   include: {
      //     questions: {
      //       include: {
      //         question: true,
      //       },
      //       orderBy: {
      //         order: "asc",
      //       },
      //     },
      //   },
      // },
      users: {
        include: {
          user: {
            include: {
              jobs: true,
              sessions: true,
              tokens: true,
            },
          },
        },
      },
      createdBy: true,
      // interviewDetails: true,
    },
  })

  if (!job) throw new NotFoundError()

  return job
}

export default getJob
