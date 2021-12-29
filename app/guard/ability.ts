import db from "db"
import { GuardBuilder } from "@blitz-guard/core"

type ExtendedResourceTypes =
  | "job"
  | "user"
  | "tokens"
  | "membership"
  | "category"
  | "stage"
  | "stagesOnWorkflows"

type ExtendedAbilityTypes = "readAll" | "isOwner" | "isAdmin" | "inviteUser"

const Guard = GuardBuilder<ExtendedResourceTypes, ExtendedAbilityTypes>(
  async (ctx, { can, cannot }) => {
    cannot("manage", "all")

    if (ctx.session.$isAuthorized()) {
      can("create", "job")
      can("read", "job", async (args) => {
        const job = await db.job.findFirst({
          where: args.where,
          include: {
            memberships: true,
          },
        })

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

        const owner = job?.memberships.find((p) => p.role === "OWNER")
        const admins = job?.memberships.filter((m) => m.role === "ADMIN")

        return (
          admins?.some((a) => a.userId === ctx.session.userId) ||
          owner?.userId === ctx.session.userId
        )
      })
      can("inviteUser", "job", async (args) => {
        console.log("args", args)
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
      can("isOwner", "category")
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
      can("isOwner", "stage")
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

      can("update", "stagesOnWorkflows", async (args) => {
        const stageOnWorkflow = await db.stagesOnWorkflows.findFirst({
          where: args.where,
        })

        const stage = await db.stage.findFirst({
          where: {
            id: stageOnWorkflow?.stageId,
          },
          include: {
            workflows: true,
          },
        })

        return stage?.workflows.every((p) => p.userId === ctx.session.userId) === true
      })
    }
  }
)

export default Guard
