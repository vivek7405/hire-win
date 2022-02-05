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

export enum ShiftDirection {
  UP,
  DOWN,
}

export type ExtendedJob = Prisma.JobGetPayload<{
  include: {
    memberships: true
    category: true
    form: {
      include: {
        questions: {
          include: {
            question: true
          }
        }
      }
    }
  }
}>
export type ExtendedCandidate = Prisma.CandidateGetPayload<{
  include: {
    job: true
    answers: {
      include: {
        question: {
          include: {
            options: true
          }
        }
      }
    }
  }
}>
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
export type ExtendedAnswer = Prisma.AnswerGetPayload<{
  include: {
    question: {
      include: {
        options: true
      }
    }
  }
}>
export type ExtendedStage = Prisma.StageGetPayload<{ include: { workflows: true } }>
export type ExtendedWorkflow = Prisma.WorkflowGetPayload<{ include: { stages: true } }>
export type ExtendedWorkflowStage = Prisma.WorkflowStageGetPayload<{ include: { stage: true } }>

export type ExtendedQuestion = Prisma.QuestionGetPayload<{ include: { forms: true } }>
export type ExtendedForm = Prisma.FormGetPayload<{ include: { questions: true } }>
export type ExtendedFormQuestion = Prisma.FormQuestionGetPayload<{ include: { question: true } }>

export type AttachmentObject = {
  Key: string
  Location: string
}
