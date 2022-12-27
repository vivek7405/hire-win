import { AuthenticationError, Ctx } from "blitz"
import db from "db"
import slugify from "slugify"
import { Job, JobInputType } from "src/jobs/validations"
import Guard from "src/guard/ability"
import { findFreeSlug } from "src/core/utils/findFreeSlug"
import {
  Behaviour,
  CompanyUserRole,
  FormQuestionType,
  JobUserRole,
  SalaryType,
} from "@prisma/client"
import moment from "moment"

async function createJob(data: JobInputType, ctx: Ctx) {
  ctx.session.$authorize()

  const {
    title,
    description,
    categoryId,
    country,
    state,
    city,
    remoteOption,
    postToGoogle,
    currency,
    minSalary,
    maxSalary,
    salaryType,
    showSalary,
    jobType,
    // validThrough,
  } = Job.parse(data)

  const user = await db.user.findFirst({
    where: { id: ctx.session.userId! },
    include: { defaultCalendars: true, defaultSchedules: true },
  })
  if (!user) throw new AuthenticationError()

  const slug = slugify(title, { strict: true, lower: true })
  const newSlug = await findFreeSlug(
    slug,
    async (e) =>
      await db.job.findFirst({ where: { slug: e, companyId: ctx.session.companyId || "0" } }),
    500
  )

  // const defaultScoreCard = await db.scoreCard.findFirst({
  //   where: { companyId: ctx.session.companyId || "0", name: "Default" },
  // })

  // const workflow = await db.workflow.findFirst({
  //   where: { id: workflowId },
  //   include: { stages: { include: { stage: true } } },
  // })

  const job = await db.job.create({
    data: {
      title,
      slug: newSlug,
      description,
      categoryId: categoryId || null,
      country,
      state,
      city,
      remoteOption,
      postToGoogle,
      currency: currency || "",
      minSalary: minSalary || 0,
      maxSalary: maxSalary || 0,
      salaryType: salaryType || SalaryType.YEAR,
      showSalary,
      jobType,
      // validThrough: moment(validThrough || undefined)
      //   .utc()
      //   .toDate(),
      users: {
        create: {
          role: JobUserRole.OWNER,
          user: {
            connect: {
              id: user.id,
            },
          },
        },
      },
      // scoreCards: {
      //   createMany: {
      //     data: scoreCards?.map((scoreCardJobWorkflowStage) => {
      //       return {
      //         scoreCardId: scoreCardJobWorkflowStage?.scoreCardId,
      //         workflowStageId: scoreCardJobWorkflowStage?.workflowStageId!,
      //       }
      //     })!,
      //   },
      // },
      // interviewDetails: {
      //   createMany: {
      //     data:
      //       workflow?.stages?.map((ws) => {
      //         return {
      //           workflowStageId: ws.id || "",
      //           interviewerId: user.id || "0",
      //           // calendarId: user.defaultCalendars?.find((cal) => cal.userId === user.id)?.calendarId || null,
      //           // scheduleId: user.schedules?.find((sch) => sch.name === "Default")?.id || "0",
      //           duration: 30,
      //         }
      //       }) || [],
      //   },
      // },
      // interviewDetails: {
      //   createMany: {
      //     data:
      //       workflow?.stages?.map((ws) => {
      //         return {
      //           workflowStageId: ws.id || "",
      //           interviewerId: user.id || "0",
      //           // calendarId: user.defaultCalendars?.find((cal) => cal.userId === user.id)?.calendarId || null,
      //           // scheduleId: user.schedules?.find((sch) => sch.name === "Default")?.id || "0",
      //           duration: 30,
      //         }
      //       }) || [],
      //   },
      // },
      // jobUserScheduleCalendars: {
      //   createMany: {
      //     data:
      //       workflow?.stages?.map((ws) => {
      //         return {
      //           workflowStageId: ws.id || "",
      //           userId: user.id || "0",
      //           calendarId:
      //             user.defaultCalendars?.find((cal) => cal.userId === user.id)?.calendarId || null,
      //           scheduleId: user.schedules?.find((sch) => sch.name === "Default")?.id || "0",
      //         }
      //       }) || [],
      //   },
      // },
      companyId: ctx.session.companyId || "0",
      createdById: ctx.session.userId || "0",
    },
  })

  await db.formQuestion.createMany({
    data: [
      {
        jobId: job?.id || "0",
        order: 1,
        allowEdit: false,
        behaviour: Behaviour.REQUIRED,
        allowBehaviourEdit: false,
        title: "Name",
        slug: "name",
        placeholder: "Enter your name",
        type: FormQuestionType.Single_line_text,
        acceptedFiles: "",
        createdById: ctx.session.userId || "0",
      },
      {
        jobId: job?.id || "0",
        order: 2,
        allowEdit: false,
        behaviour: Behaviour.REQUIRED,
        allowBehaviourEdit: false,
        title: "Email",
        slug: "email",
        placeholder: "Enter your email",
        type: FormQuestionType.Email,
        acceptedFiles: "",
        createdById: ctx.session.userId || "0",
      },
      {
        jobId: job?.id || "0",
        order: 3,
        allowEdit: false,
        behaviour: Behaviour.REQUIRED,
        allowBehaviourEdit: true,
        title: "Resume",
        slug: "resume",
        placeholder: "",
        type: FormQuestionType.Attachment,
        acceptedFiles: "application/pdf",
        createdById: ctx.session.userId || "0",
      },
      {
        jobId: job?.id || "0",
        order: 4,
        allowEdit: true,
        behaviour: Behaviour.OPTIONAL,
        allowBehaviourEdit: true,
        title: "Phone Number",
        slug: "phone-number",
        placeholder: "Enter your phone number",
        type: FormQuestionType.Phone_number,
        acceptedFiles: "",
        createdById: ctx.session.userId || "0",
      },
      {
        jobId: job?.id || "0",
        order: 5,
        allowEdit: true,
        behaviour: Behaviour.OPTIONAL,
        allowBehaviourEdit: true,
        title: "Location",
        slug: "location",
        placeholder: "Enter your current location",
        type: FormQuestionType.Single_line_text,
        acceptedFiles: "",
        createdById: ctx.session.userId || "0",
      },
      {
        jobId: job?.id || "0",
        order: 6,
        allowEdit: true,
        behaviour: Behaviour.OPTIONAL,
        allowBehaviourEdit: true,
        title: "LinkedIn Profile",
        slug: "linkedin-profile",
        placeholder: "Enter your LinkedIn Profile URL",
        type: FormQuestionType.URL,
        acceptedFiles: "",
        createdById: ctx.session.userId || "0",
      },
    ],
  })

  await db.stage.createMany({
    data: [
      {
        jobId: job?.id || "0",
        name: "Sourced",
        slug: "sourced",
        order: 1,
        allowEdit: false,
        createdById: ctx.session.userId,
        interviewerId: ctx.session.userId,
        duration: 15,
      },
      {
        jobId: job?.id || "0",
        name: "Screen",
        slug: "screen",
        order: 2,
        allowEdit: true,
        createdById: ctx.session.userId,
        interviewerId: ctx.session.userId,
        duration: 15,
      },
      {
        jobId: job?.id || "0",
        name: "Interview",
        slug: "interview",
        order: 3,
        allowEdit: true,
        createdById: ctx.session.userId,
        interviewerId: ctx.session.userId,
        duration: 30,
      },
      {
        jobId: job?.id || "0",
        name: "Offer",
        slug: "offer",
        order: 4,
        allowEdit: true,
        createdById: ctx.session.userId,
        interviewerId: ctx.session.userId,
        duration: 15,
      },
      {
        jobId: job?.id || "0",
        name: "Hired",
        slug: "hired",
        order: 5,
        allowEdit: false,
        createdById: ctx.session.userId,
        interviewerId: ctx.session.userId,
        duration: 15,
      },
    ],
  })

  const stages = await db.stage.findMany({
    where: { jobId: job?.id || "0" },
    orderBy: { order: "asc" },
  })

  // await db.interviewDetail.createMany({
  //   data:
  //     stages?.map((stage) => {
  //       return {
  //         jobId: job?.id || "0",
  //         stageId: stage?.id,
  //         interviewerId: user.id || "0",
  //         duration: 30,
  //       }
  //     }) || [],
  // })

  await db.scoreCardQuestion.createMany({
    data: stages
      ?.map((stage) => {
        switch (stage?.name) {
          case "Sourced":
            return [
              {
                stageId: stage.id,
                title: "Fits the Role",
                slug: "fits-the-role",
                order: 1,
                createdById: user.id,
              },
              {
                stageId: stage.id,
                title: "Qualification",
                slug: "qualification",
                order: 2,
                createdById: user.id,
              },
              {
                stageId: stage.id,
                title: "Job Description Match",
                slug: "job-description-match",
                order: 3,
                createdById: user.id,
              },
            ]
          case "Screen":
            return [
              {
                stageId: stage.id,
                title: "Communication",
                slug: "communication",
                order: 1,
                createdById: user.id,
              },
              {
                stageId: stage.id,
                title: "Salary Expectation Match",
                slug: "salary-expectation-match",
                order: 2,
                createdById: user.id,
              },
              {
                stageId: stage.id,
                title: "Notice Period Match",
                slug: "notice-period-match",
                order: 3,
                createdById: user.id,
              },
            ]
          case "Interview":
            return [
              {
                stageId: stage.id,
                title: "Overall Performance",
                slug: "overall-performance",
                order: 1,
                createdById: user.id,
              },
              {
                stageId: stage.id,
                title: "Attitude & Behaviour",
                slug: "attitude-and-behaviour",
                order: 2,
                createdById: user.id,
              },
              {
                stageId: stage.id,
                title: "Problem Solving Skills",
                slug: "problem-solving-skills",
                order: 3,
                createdById: user.id,
              },
            ]
          case "Offer":
            return [
              {
                stageId: stage.id,
                title: "Background Verification",
                slug: "background-verification",
                order: 1,
                createdById: user.id,
              },
              {
                stageId: stage.id,
                title: "Probability of Joining",
                slug: "probability-of-joining",
                order: 2,
                createdById: user.id,
              },
              {
                stageId: stage.id,
                title: "Holds fewer offers",
                slug: "holds-fewer-offers",
                order: 3,
                createdById: user.id,
              },
            ]
          case "Hired":
            return [
              {
                stageId: stage.id,
                title: "Received all Documents",
                slug: "received-all-documents",
                order: 1,
                createdById: user.id,
              },
              {
                stageId: stage.id,
                title: "Project Manager Review",
                slug: "project-manager-review",
                order: 2,
                createdById: user.id,
              },
              {
                stageId: stage.id,
                title: "Retention Estimate",
                slug: "retention-estimate",
                order: 3,
                createdById: user.id,
              },
            ]
          default:
            return [
              {
                stageId: stage.id,
                title: "Generalized Review",
                slug: "generalized-review",
                order: 1,
                createdById: user.id,
              },
            ]
        }
      })
      ?.flat(),
  })

  await db.stageUserScheduleCalendar.createMany({
    data:
      stages?.map((stage) => {
        return {
          stageId: stage.id || "0",
          userId: user.id || "0",
          calendarId:
            user.defaultCalendars?.find((cal) => cal.userId === user.id)?.calendarId || null,
          scheduleId:
            user.defaultSchedules?.find((sch) => sch.userId === user.id)?.scheduleId || "0",
        }
      }) || [],
  })

  const jobCreatedByCompanyUser = await db.companyUser.findFirst({
    where: {
      companyId: ctx.session.companyId || "0",
      userId: ctx.session.userId || "0",
    },
  })
  // if job creator is not the company owner, assign the job to them as well
  if (job && jobCreatedByCompanyUser && jobCreatedByCompanyUser.role !== CompanyUserRole.OWNER) {
    // Assign the job to company owner as well
    const companyUserOwner = await db.companyUser.findFirst({
      where: {
        companyId: jobCreatedByCompanyUser?.companyId,
        role: CompanyUserRole.OWNER,
      },
    })
    if (companyUserOwner) {
      await db.jobUser.create({
        data: {
          jobId: job.id,
          userId: companyUserOwner.userId,
          role: JobUserRole.ADMIN,
        },
      })
    }
  }

  return job
}

export default Guard.authorize("create", "job", createJob)
