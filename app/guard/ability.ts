import db, { CompanyUserRole, JobUserRole } from "db"
import { GuardBuilder } from "@blitz-guard/core"
import { checkPlan } from "app/users/utils/checkPlan"
import moment from "moment"

type ExtendedResourceTypes =
  | "job"
  | "user"
  | "tokens"
  | "membership"
  | "category"
  | "stage"
  | "workflowStage"
  | "workflow"
  | "question"
  | "formQuestion"
  | "form"
  | "candidate"
  | "cardQuestion"
  | "scoreCardQuestion"
  | "scoreCard"
  | "schedule"
  | "calendar"
  | "interview"
  | "comment"
  | "candidatePool"
  | "company"
  | "companyUser"
  | "jobListing"

type ExtendedAbilityTypes =
  | "access"
  | "readAll"
  | "isOwner"
  | "isAdmin"
  | "inviteUser"
  | "cancelInterview"

const Guard = GuardBuilder<ExtendedResourceTypes, ExtendedAbilityTypes>(
  async (ctx, { can, cannot }) => {
    cannot("manage", "all")

    // Allow only 25 candidates on the Free plan
    // Don't allow if job is archived or expired
    const isFreePlanCandidateLimitAvailable = async (args) => {
      const jobId = args?.jobId

      if (!jobId || jobId?.trim() === "") return false

      const job = await db.job.findFirst({
        where: { id: jobId },
        include: { company: true, _count: { select: { candidates: true } } },
      })

      if (!job || !job?.company) return false

      const currentPlan = checkPlan(job.company)
      if (!currentPlan) {
        if (job._count.candidates >= 25) {
          return false
        }
      }

      return true
    }

    can("create", "candidate", async (args) => {
      const jobId = args?.jobId

      if (!jobId || jobId?.trim() === "") return false

      const job = await db.job.findFirst({
        where: { id: jobId },
        include: { company: true, users: true, _count: { select: { candidates: true } } },
      })

      if (!job || !job?.company) return false

      const owner = job.users.find((p) => p.role === JobUserRole.OWNER)
      const admins = job.users.filter((m) => m.role === JobUserRole.ADMIN)

      return (
        (admins?.some((a) => a.userId === ctx.session.userId) ||
          owner?.userId === ctx.session.userId) &&
        isFreePlanCandidateLimitAvailable(args)
      )
    })

    can("access", "jobListing", async (args) => {
      const jobId = args?.jobId

      if (!jobId || jobId?.trim() === "") return false

      const job = await db.job.findFirst({
        where: { id: jobId },
        include: { company: true, _count: { select: { candidates: true } } },
      })

      if (!job || !job?.company) return false

      const jobExpired = moment(job.validThrough || undefined).diff(moment()) < 0
      if (job.archived || jobExpired) return false

      return isFreePlanCandidateLimitAvailable(args)
    })

    if (ctx.session.$isAuthorized()) {
      can("create", "job", async (args) => {
        // Check user plan and don't allow to create a new job
        // if the user is running on the Free Plan and already has 1 (or more) job
        const company = await db.company.findFirst({
          where: { id: ctx.session.companyId || 0 },
          include: {
            jobs: true,
          },
        })
        const allUserJobsLength = company?.jobs?.length || 0
        if (allUserJobsLength >= 1) {
          const currentPlan = checkPlan(company)
          if (!currentPlan) return false
        }
        return true
      })
      can("read", "job", async (args) => {
        const job = await db.job.findFirst({
          where: args.where,
          // include: {
          //   users: {
          //     include: {
          //       user: true,
          //     },
          //   },
          // },
        })

        // Check user plan and don't allow to read the job
        // if the user is running on the Free Plan and has more than 1 job
        const company = await db.company.findFirst({
          where: { id: ctx.session.companyId || 0 },
          include: {
            jobs: true,
          },
        })
        const allCompanyJobsLength = company?.jobs?.length || 0
        if (allCompanyJobsLength > 1) {
          const currentPlan = checkPlan(company)
          if (!currentPlan) return false
        }

        return job?.companyId === ctx.session.companyId
      })
      can("readAll", "job", async (args) => {
        const jobUsers = await db.jobUser.findMany({
          where: args.where,
        })

        return jobUsers.every((p) => p.userId === ctx.session.userId) === true
      })
      can("update", "job", async (args) => {
        const job = await db.job.findFirst({
          where: args.where,
          include: {
            // company: {
            //   include: {
            //     users: true,
            //   },
            // },
            users: true,
          },
        })

        // Check user plan and don't allow to read the job
        // if the user is running on the Free Plan and has more than 1 job
        const company = await db.company.findFirst({
          where: { id: ctx.session.companyId || 0 },
          include: {
            jobs: true,
          },
        })
        const allCompanyJobsLength = company?.jobs?.length || 0
        if (allCompanyJobsLength > 1) {
          const currentPlan = checkPlan(company)
          if (!currentPlan) return false
        }

        const owner = job?.users.find((u) => u.role === JobUserRole.OWNER)
        const admins = job?.users.filter((u) => u.role === JobUserRole.ADMIN)

        return (
          ctx.session.companyId === job?.companyId &&
          (admins?.some((a) => a.userId === ctx.session.userId) ||
            owner?.userId === ctx.session.userId)
        )
      })
      can("inviteUser", "job", async (args) => {
        const job = await db.job.findFirst({
          where: { id: args.jobId },
          include: {
            users: true,
          },
        })

        // Check user plan and don't allow to invite to job
        // if the user is running on the Free Plan
        const company = await db.company.findFirst({
          where: { id: ctx.session.companyId || 0 },
          include: {
            jobs: true,
          },
        })
        const currentPlan = checkPlan(company)
        if (!currentPlan) return false

        const owner = job?.users.find((p) => p.role === JobUserRole.OWNER)
        const admins = job?.users.filter((m) => m.role === JobUserRole.ADMIN)

        return (
          admins?.some((a) => a.userId === ctx.session.userId) ||
          owner?.userId === ctx.session.userId
        )
      })

      can("isOwner", "job", async (args) => {
        const job = await db.job.findFirst({
          where: args.where,
          include: {
            users: true,
          },
        })

        const owner = job?.users.find((p) => p.role === JobUserRole.OWNER)

        return owner?.userId === ctx.session.userId
      })

      can("isAdmin", "job", async (args) => {
        const job = await db.job.findFirst({
          where: args.where,
          include: {
            users: true,
          },
        })

        const admins = job?.users.filter((m) => m.role === JobUserRole.ADMIN)

        return admins?.some((a) => a.userId === ctx.session.userId) === true
      })

      can("update", "membership", async (args) => {
        const jobUser = await db.jobUser.findFirst({
          where: args.where,
        })

        const job = await db.job.findFirst({
          where: {
            id: jobUser?.jobId,
          },
          include: {
            users: true,
          },
        })

        const owner = job?.users.find((p) => p.role === JobUserRole.OWNER)

        return owner?.userId === ctx.session.userId
      })

      can("update", "companyUser", async (args) => {
        const companyUser = await db.companyUser.findFirst({
          where: args.where,
        })

        const company = await db.company.findFirst({
          where: {
            id: companyUser?.companyId,
          },
          include: {
            users: true,
          },
        })

        const owner = company?.users.find((p) => p.role === CompanyUserRole.OWNER)

        return owner?.userId === ctx.session.userId
      })

      can("update", "user", async (args) => {
        return args.where.id === ctx.session.userId
      })

      can("create", "company", async (args) => {
        const companyUsers = await db.companyUser.findMany({
          where: { userId: ctx.session.userId || 0 },
          include: { company: true },
        })

        if (companyUsers && companyUsers.length >= 1) {
          const allCompaniesOnProPlan = companyUsers.every((cu) => checkPlan(cu.company))
          return allCompaniesOnProPlan
        } else {
          // User with no company can create one
          return true
        }
      })

      can("inviteUser", "company", async (args) => {
        // const company = await db.company.findFirst({
        //   where: { id: args.companyId },
        //   include: {
        //     users: true,
        //   },
        // })

        // Check user plan and don't allow to invite to job
        // if the user is running on the Free Plan
        const company = await db.company.findFirst({
          where: { id: ctx.session.companyId || 0 },
          include: {
            // jobs: true,
            users: true,
          },
        })
        const currentPlan = checkPlan(company)
        if (!currentPlan) return false

        const owner = company?.users.find((u) => u.role === CompanyUserRole.OWNER)
        const admins = company?.users.filter((u) => u.role === CompanyUserRole.ADMIN)

        return (
          admins?.some((a) => a.userId === ctx.session.userId) ||
          owner?.userId === ctx.session.userId
        )
      })

      can("update", "company", async (args) => {
        const companyUser = await db.companyUser.findUnique({
          where: {
            userId_companyId: {
              userId: ctx.session.userId || 0,
              companyId: ctx.session.companyId || 0,
            },
          },
        })
        return (
          args.where.id === companyUser?.companyId && companyUser?.role === CompanyUserRole.OWNER
        )
      })

      can("isOwner", "company", async (args) => {
        const company = await db.company.findFirst({
          where: args.where,
          include: {
            users: true,
          },
        })

        const owner = company?.users.find((p) => p.role === CompanyUserRole.OWNER)

        return owner?.userId === ctx.session.userId
      })

      can("isAdmin", "company", async (args) => {
        const company = await db.company.findFirst({
          where: args.where,
          include: {
            users: true,
          },
        })

        const admins = company?.users.filter((m) => m.role === CompanyUserRole.ADMIN)

        return admins?.some((a) => a.userId === ctx.session.userId) === true
      })

      can("read", "tokens", async (args) => {
        const job = await db.job.findFirst({
          where: {
            id: args.where.jobId,
          },
          include: {
            users: true,
          },
        })

        return job?.users.some((p) => p.userId === ctx.session.userId) === true
      })

      can("create", "category")
      can("update", "category")
      can("read", "category", async (args) => {
        const companyUser = await db.companyUser.findUnique({
          where: {
            userId_companyId: {
              userId: ctx.session.userId || 0,
              companyId: ctx.session.companyId || 0,
            },
          },
        })
        if (companyUser?.role === CompanyUserRole.USER) {
          return false
        }

        const category = await db.category.findFirst({
          where: args.where,
        })

        return category?.companyId === ctx.session.companyId
      })
      can("readAll", "category", async (args) => {
        const companyUser = await db.companyUser.findUnique({
          where: {
            userId_companyId: {
              userId: ctx.session.userId || 0,
              companyId: ctx.session.companyId || 0,
            },
          },
        })
        if (companyUser?.role === CompanyUserRole.USER) {
          return false
        }

        const category = await db.category.findMany({
          where: args.where,
        })

        return category.every((c) => c.companyId === ctx.session.companyId) === true
      })

      can("read", "candidatePool", async (args) => {
        const candidatePool = await db.candidatePool.findFirst({
          where: args.where,
        })

        return candidatePool?.companyId === ctx.session.companyId ? true : false
      })
      can("readAll", "candidatePool", async (args) => {
        const candidatePools = await db.candidatePool.findMany({
          where: args.where,
        })

        return candidatePools.every((c) => c.companyId === ctx.session.companyId) === true
      })

      can("create", "stage")
      can("update", "stage")
      can("read", "stage", async (args) => {
        const stage = await db.stage.findFirst({
          where: args.where,
        })

        return stage?.companyId === ctx.session.companyId
      })
      can("readAll", "stage", async (args) => {
        const stages = await db.stage.findMany({
          where: args.where,
        })

        return stages.every((p) => p.companyId === ctx.session.companyId) === true
      })

      can("create", "workflowStage")
      can("read", "workflowStage", async (args) => {
        const workflowStage = await db.workflowStage.findFirst({
          where: args.where,
          include: {
            workflow: true,
          },
        })

        return workflowStage?.workflow.companyId === ctx.session.companyId
      })
      can("readAll", "workflowStage", async (args) => {
        const workflowStages = await db.workflowStage.findMany({
          where: args.where,
          include: {
            workflow: true,
          },
        })

        return workflowStages.every((p) => p.workflow.companyId === ctx.session.companyId) === true
      })
      can("update", "workflowStage", async (args) => {
        const workflowStage = await db.workflowStage.findFirst({
          where: args.where,
          include: {
            workflow: true,
          },
        })

        return workflowStage?.workflow.companyId === ctx.session.companyId
      })

      can("create", "workflow")
      can("update", "workflow")
      can("read", "workflow", async (args) => {
        const companyUser = await db.companyUser.findUnique({
          where: {
            userId_companyId: {
              userId: ctx.session.userId || 0,
              companyId: ctx.session.companyId || 0,
            },
          },
        })
        if (companyUser?.role === CompanyUserRole.USER) {
          return false
        }

        const workflow = await db.workflow.findFirst({
          where: args.where,
        })

        return workflow?.companyId === ctx.session.companyId
      })
      can("readAll", "workflow", async (args) => {
        const companyUser = await db.companyUser.findUnique({
          where: {
            userId_companyId: {
              userId: ctx.session.userId || 0,
              companyId: ctx.session.companyId || 0,
            },
          },
        })
        if (companyUser?.role === CompanyUserRole.USER) {
          return false
        }

        const workflows = await db.workflow.findMany({
          where: args.where,
        })

        return workflows.every((p) => p.companyId === ctx.session.companyId) === true
      })

      can("create", "cardQuestion")
      can("read", "cardQuestion", async (args) => {
        const cardQuestion = await db.cardQuestion.findFirst({
          where: args.where,
        })

        return cardQuestion?.companyId === ctx.session.companyId
      })
      can("update", "cardQuestion", async (args) => {
        const cardQuestion = await db.cardQuestion.findFirst({
          where: args.where,
        })

        return !cardQuestion?.factory && cardQuestion?.companyId === ctx.session.companyId
      })
      can("readAll", "cardQuestion", async (args) => {
        const cardQuestions = await db.cardQuestion.findMany({
          where: args.where,
        })

        return cardQuestions.every((p) => p.companyId === ctx.session.companyId) === true
      })

      can("create", "scoreCardQuestion")
      can("read", "scoreCardQuestion", async (args) => {
        const scoreCardQuestion = await db.scoreCardQuestion.findFirst({
          where: args.where,
          include: {
            scoreCard: true,
          },
        })

        return scoreCardQuestion?.scoreCard.companyId === ctx.session.companyId
      })
      can("readAll", "scoreCardQuestion", async (args) => {
        const scoreCardQuestions = await db.scoreCardQuestion.findMany({
          where: args.where,
          include: {
            scoreCard: true,
          },
        })

        return (
          scoreCardQuestions.every((p) => p.scoreCard.companyId === ctx.session.companyId) === true
        )
      })
      can("update", "scoreCardQuestion", async (args) => {
        const scoreCardQuestion = await db.scoreCardQuestion.findFirst({
          where: args.where,
          include: {
            scoreCard: true,
          },
        })

        return scoreCardQuestion?.scoreCard.companyId === ctx.session.companyId
      })

      can("create", "scoreCard")
      can("update", "scoreCard")
      can("read", "scoreCard", async (args) => {
        const scoreCard = await db.scoreCard.findFirst({
          where: args.where,
        })

        return scoreCard?.companyId === ctx.session.companyId
      })
      can("readAll", "scoreCard", async (args) => {
        const companyUser = await db.companyUser.findUnique({
          where: {
            userId_companyId: {
              userId: ctx.session.userId || 0,
              companyId: ctx.session.companyId || 0,
            },
          },
        })
        if (companyUser?.role === CompanyUserRole.USER) {
          return false
        }

        const scoreCards = await db.scoreCard.findMany({
          where: args.where,
        })

        return scoreCards.every((p) => p.companyId === ctx.session.companyId) === true
      })

      can("create", "schedule")
      can("update", "schedule")
      can("read", "schedule", async (args) => {
        const schedule = await db.schedule.findFirst({
          where: args.where,
        })

        return schedule?.ownerId === ctx.session.userId
      })
      can("readAll", "schedule", async (args) => {
        const schedules = await db.schedule.findMany({
          where: args.where,
        })

        return schedules.every((p) => p.ownerId === ctx.session.userId) === true
      })

      can("create", "calendar")
      can("update", "calendar")
      can("read", "calendar", async (args) => {
        const calendar = await db.calendar.findFirst({
          where: args.where,
        })

        return calendar?.ownerId === ctx.session.userId
      })
      can("readAll", "calendar", async (args) => {
        const calendars = await db.calendar.findMany({
          where: args.where,
        })

        return calendars.every((p) => p.ownerId === ctx.session.userId) === true
      })

      can("create", "question")
      can("read", "question", async (args) => {
        const question = await db.question.findFirst({
          where: args.where,
        })

        return question?.companyId === ctx.session.companyId
      })
      can("update", "question", async (args) => {
        const question = await db.question.findFirst({
          where: args.where,
        })

        return !question?.factory && question?.companyId === ctx.session.companyId
      })
      can("readAll", "question", async (args) => {
        const questions = await db.question.findMany({
          where: args.where,
        })

        return questions.every((p) => p.companyId === ctx.session.companyId) === true
      })

      can("create", "formQuestion")
      can("read", "formQuestion", async (args) => {
        const formQuestion = await db.formQuestion.findFirst({
          where: args.where,
          include: {
            form: true,
          },
        })

        return formQuestion?.form.companyId === ctx.session.companyId
      })
      can("readAll", "formQuestion", async (args) => {
        const formQuestions = await db.formQuestion.findMany({
          where: args.where,
          include: {
            form: true,
          },
        })

        return formQuestions.every((p) => p.form.companyId === ctx.session.companyId) === true
      })
      can("update", "formQuestion", async (args) => {
        const formQuestion = await db.formQuestion.findFirst({
          where: args.where,
          include: {
            form: true,
          },
        })

        return formQuestion?.form.companyId === ctx.session.companyId
      })

      can("create", "form")
      can("update", "form")
      can("read", "form", async (args) => {
        const companyUser = await db.companyUser.findUnique({
          where: {
            userId_companyId: {
              userId: ctx.session.userId || 0,
              companyId: ctx.session.companyId || 0,
            },
          },
        })
        if (companyUser?.role === CompanyUserRole.USER) {
          return false
        }

        const form = await db.form.findFirst({
          where: args.where,
        })

        return form?.companyId === ctx.session.companyId
      })
      can("readAll", "form", async (args) => {
        const companyUser = await db.companyUser.findUnique({
          where: {
            userId_companyId: {
              userId: ctx.session.userId || 0,
              companyId: ctx.session.companyId || 0,
            },
          },
        })
        if (companyUser?.role === CompanyUserRole.USER) {
          return false
        }

        const forms = await db.form.findMany({
          where: args.where,
        })

        return forms.every((p) => p.companyId === ctx.session.companyId) === true
      })

      can("update", "candidate", async (args) => {
        const candidate = await db.candidate.findFirst({
          where: args.where,
          include: {
            job: {
              include: {
                users: true,
                company: {
                  include: { users: true },
                },
              },
            },
          },
        })

        const owner = candidate?.job?.users.find((p) => p.role === JobUserRole.OWNER)
        const admins = candidate?.job?.users.filter((m) => m.role === JobUserRole.ADMIN)

        return (
          ctx.session?.companyId === candidate?.job?.companyId &&
          candidate?.job?.company?.users.some((m) => m.userId === ctx.session.userId) === true &&
          (admins?.some((a) => a.userId === ctx.session.userId) ||
            owner?.userId === ctx.session.userId)
        )
      })
      can("read", "candidate", async (args) => {
        const candidate = await db.candidate.findFirst({
          where: args.where,
          include: {
            job: {
              include: {
                // users: true,
                company: {
                  include: { users: true },
                },
              },
            },
          },
        })

        return (
          ctx.session?.companyId === candidate?.job?.companyId &&
          candidate?.job?.company?.users.some((m) => m.userId === ctx.session.userId) === true
        )
      })
      can("readAll", "candidate", async (args) => {
        const candidates = await db.candidate.findMany({
          where: args.where,
          include: {
            job: {
              include: {
                users: true,
              },
            },
          },
        })

        return (
          candidates.every(
            (c) => c.job.users.some((m) => m.userId === ctx.session.userId) === true
          ) === true
        )
      })

      can("cancelInterview", "interview", async (args) => {
        const interview = await db.interview.findUnique({
          where: { id: args.interviewId },
          include: { job: { include: { users: true } } },
        })

        return (
          ctx.session.userId === interview?.interviewerId ||
          ctx.session.userId === interview?.organizerId ||
          interview?.job?.users?.find((jobUser) => jobUser.userId === ctx.session.userId)?.role ===
            JobUserRole.OWNER
        )
      })

      can("update", "comment", async (args) => {
        const comment = await db.comment.findFirst({
          where: { id: args.commentId, creatorId: ctx.session.userId || 0 },
        })

        return comment ? true : false
      })
      can("delete", "comment", async (args) => {
        const comment = await db.comment.findFirst({
          where: { id: args.commentId, creatorId: ctx.session.userId || 0 },
        })

        return comment ? true : false
      })
    }
  }
)

export default Guard
