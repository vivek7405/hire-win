import db from "db"
import { GuardBuilder } from "@blitz-guard/core"
import { checkPlan } from "app/users/utils/checkPlan"

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

type ExtendedAbilityTypes = "readAll" | "isOwner" | "isAdmin" | "inviteUser"

const Guard = GuardBuilder<ExtendedResourceTypes, ExtendedAbilityTypes>(
  async (ctx, { can, cannot }) => {
    cannot("manage", "all")

    if (ctx.session.$isAuthorized()) {
      can("create", "job", async (args) => {
        // Check user plan and don't allow to create a new job
        // if the user is running on the Free Plan and already has 1 (or more) job
        const user = await db.user.findFirst({
          where: { id: ctx.session.userId || 0 },
          include: {
            memberships: {
              include: {
                user: true,
              },
            },
          },
        })
        const allUserJobsLength = user?.memberships?.length || 0
        if (allUserJobsLength > 1) {
          const currentPlan = checkPlan(user)
          if (!currentPlan) return false
        }
        return true
      })
      can("read", "job", async (args) => {
        const job = await db.job.findFirst({
          where: args.where,
          include: {
            memberships: {
              include: {
                user: true,
              },
            },
          },
        })

        // Check user plan and don't allow to read the job
        // if the user is running on the Free Plan and has more than 1 job
        const user = await db.user.findFirst({
          where: { id: ctx.session.userId || 0 },
          include: {
            memberships: {
              include: {
                user: true,
              },
            },
          },
        })
        const allUserJobsLength = user?.memberships?.length || 0
        if (allUserJobsLength > 1) {
          const currentPlan = checkPlan(user)
          if (!currentPlan) return false
        }

        return job?.memberships.some((p) => p.userId === ctx.session.userId) === true
      })
      can("readAll", "job", async (args) => {
        const memberships = await db.membership.findMany({
          where: args.where,
        })

        return memberships.every((p) => p.userId === ctx.session.userId) === true
      })
      can("update", "job", async (args) => {
        const job = await db.job.findFirst({
          where: args.where,
          include: {
            memberships: true,
          },
        })

        // Check user plan and don't allow to read the job
        // if the user is running on the Free Plan and has more than 1 job
        const user = await db.user.findFirst({
          where: { id: ctx.session.userId || 0 },
          include: {
            memberships: {
              include: {
                user: true,
              },
            },
          },
        })
        const allUserJobsLength = user?.memberships?.length || 0
        if (allUserJobsLength > 1) {
          const currentPlan = checkPlan(user)
          if (!currentPlan) return false
        }

        const owner = job?.memberships.find((p) => p.role === "OWNER")
        const admins = job?.memberships.filter((m) => m.role === "ADMIN")

        return (
          admins?.some((a) => a.userId === ctx.session.userId) ||
          owner?.userId === ctx.session.userId
        )
      })
      can("inviteUser", "job", async (args) => {
        const job = await db.job.findFirst({
          where: { id: args.jobId },
          include: {
            memberships: true,
          },
        })

        const owner = job?.memberships.find((p) => p.role === "OWNER")
        const admins = job?.memberships.filter((m) => m.role === "ADMIN")

        return (
          admins?.some((a) => a.userId === ctx.session.userId) ||
          owner?.userId === ctx.session.userId
        )
      })

      can("isOwner", "job", async (args) => {
        const job = await db.job.findFirst({
          where: args.where,
          include: {
            memberships: true,
          },
        })

        const owner = job?.memberships.find((p) => p.role === "OWNER")

        return owner?.userId === ctx.session.userId
      })

      can("isAdmin", "job", async (args) => {
        const job = await db.job.findFirst({
          where: args.where,
          include: {
            memberships: true,
          },
        })

        const admins = job?.memberships.filter((m) => m.role === "ADMIN")

        return admins?.some((a) => a.userId === ctx.session.userId) === true
      })

      can("update", "membership", async (args) => {
        const member = await db.membership.findFirst({
          where: args.where,
        })

        const job = await db.job.findFirst({
          where: {
            id: member?.jobId,
          },
          include: {
            memberships: true,
          },
        })

        const owner = job?.memberships.find((p) => p.role === "OWNER")

        return owner?.userId === ctx.session.userId
      })

      can("update", "user", async (args) => {
        return args.where.id === ctx.session.userId
      })

      can("read", "tokens", async (args) => {
        const job = await db.job.findFirst({
          where: {
            id: args.where.jobId,
          },
          include: {
            memberships: true,
          },
        })

        return job?.memberships.some((p) => p.userId === ctx.session.userId) === true
      })

      can("create", "category")
      can("update", "category")
      can("read", "category", async (args) => {
        const category = await db.category.findFirst({
          where: args.where,
        })

        return category?.userId === ctx.session.userId
      })
      can("readAll", "category", async (args) => {
        const category = await db.membership.findMany({
          where: args.where,
        })

        return category.every((c) => c.userId === ctx.session.userId) === true
      })

      can("create", "stage")
      can("update", "stage")
      can("read", "stage", async (args) => {
        const stage = await db.stage.findFirst({
          where: args.where,
        })

        return stage?.userId === ctx.session.userId
      })
      can("readAll", "stage", async (args) => {
        const stages = await db.stage.findMany({
          where: args.where,
        })

        return stages.every((p) => p.userId === ctx.session.userId) === true
      })

      can("create", "workflowStage")
      can("read", "workflowStage", async (args) => {
        const workflowStage = await db.workflowStage.findFirst({
          where: args.where,
          include: {
            workflow: true,
          },
        })

        return workflowStage?.workflow.userId === ctx.session.userId
      })
      can("readAll", "workflowStage", async (args) => {
        const workflowStages = await db.workflowStage.findMany({
          where: args.where,
          include: {
            workflow: true,
          },
        })

        return workflowStages.every((p) => p.workflow.userId === ctx.session.userId) === true
      })
      can("update", "workflowStage", async (args) => {
        const workflowStage = await db.workflowStage.findFirst({
          where: args.where,
          include: {
            workflow: true,
          },
        })

        return workflowStage?.workflow.userId === ctx.session.userId
      })

      can("create", "workflow")
      can("update", "workflow")
      can("read", "workflow", async (args) => {
        const workflow = await db.workflow.findFirst({
          where: args.where,
        })

        return workflow?.userId === ctx.session.userId
      })
      can("readAll", "workflow", async (args) => {
        const workflows = await db.workflow.findMany({
          where: args.where,
        })

        return workflows.every((p) => p.userId === ctx.session.userId) === true
      })

      can("create", "question")
      can("read", "question", async (args) => {
        const question = await db.question.findFirst({
          where: args.where,
        })

        return question?.userId === ctx.session.userId
      })
      can("update", "question", async (args) => {
        const question = await db.question.findFirst({
          where: args.where,
        })

        return !question?.factory && question?.userId === ctx.session.userId
      })
      can("readAll", "question", async (args) => {
        const questions = await db.question.findMany({
          where: args.where,
        })

        return questions.every((p) => p.userId === ctx.session.userId) === true
      })

      can("create", "formQuestion")
      can("read", "formQuestion", async (args) => {
        const formQuestion = await db.formQuestion.findFirst({
          where: args.where,
          include: {
            form: true,
          },
        })

        return formQuestion?.form.userId === ctx.session.userId
      })
      can("readAll", "formQuestion", async (args) => {
        const formQuestions = await db.formQuestion.findMany({
          where: args.where,
          include: {
            form: true,
          },
        })

        return formQuestions.every((p) => p.form.userId === ctx.session.userId) === true
      })
      can("update", "formQuestion", async (args) => {
        const formQuestion = await db.formQuestion.findFirst({
          where: args.where,
          include: {
            form: true,
          },
        })

        return formQuestion?.form.userId === ctx.session.userId
      })

      can("create", "form")
      can("update", "form")
      can("read", "form", async (args) => {
        const form = await db.form.findFirst({
          where: args.where,
        })

        return form?.userId === ctx.session.userId
      })
      can("readAll", "form", async (args) => {
        const forms = await db.form.findMany({
          where: args.where,
        })

        return forms.every((p) => p.userId === ctx.session.userId) === true
      })

      // Anyone can create a candidate without authentication
      can("update", "candidate")
      can("read", "candidate", async (args) => {
        const candidate = await db.candidate.findFirst({
          where: args.where,
          include: {
            job: {
              include: {
                memberships: true,
              },
            },
          },
        })

        return candidate?.job.memberships.some((m) => m.userId === ctx.session.userId) === true
      })
      can("readAll", "candidate", async (args) => {
        const candidates = await db.candidate.findMany({
          where: args.where,
          include: {
            job: {
              include: {
                memberships: true,
              },
            },
          },
        })

        return (
          candidates.every(
            (c) => c.job.memberships.some((m) => m.userId === ctx.session.userId) === true
          ) === true
        )
      })
    }
  }
)

export default Guard
