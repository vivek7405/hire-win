import { DefaultCtx, SessionContext, SimpleRolesIsAuthorized } from "blitz"
import { User } from "db"
import { Prisma } from "@prisma/client"
import { plans } from "app/core/utils/plans"

// Note: You should switch to Postgres and then use a DB enum for role type
export type Role = "ADMIN" | "USER"

export type Plan = keyof typeof plans

declare module "blitz" {
  export interface Ctx extends DefaultCtx {
    session: SessionContext
  }
  export interface Session {
    isAuthorized: SimpleRolesIsAuthorized<Role>
    PublicData: {
      userId: User["id"]
      role: Role
    }
  }
}

export type ExtendedJob = Prisma.JobGetPayload<{ include: { memberships: true } }>
export type ExtendedStage = Prisma.StageGetPayload<{ include: { workflows: true } }>
export type ExtendedCategory = Prisma.CategoryGetPayload<{ include: { jobs: true } }>
export type ExtendedUser = Prisma.UserGetPayload<{
  include: {
    memberships: {
      include: {
        job: true
      }
    }
  }
}>
