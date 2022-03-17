import { DefaultCtx, SessionContext, SimpleRolesIsAuthorized } from "blitz"
import { User } from "db"
import { Prisma, UserRole } from "@prisma/client"

export enum PlanName {
  PRO,
}

export type Plan = {
  name: PlanName
  priceId: string
  title: string
  price: number
  frequency: string
  description: string
  features: string[]
}

export type KanbanCardType = {
  id: string
  title: string
  description: string
  renderContent: any
}
export type KanbanColumnType = {
  id: string
  title: string
  cards: KanbanCardType[]
}
export type KanbanBoardType = {
  columns: KanbanColumnType[]
}

declare module "blitz" {
  export interface Ctx extends DefaultCtx {
    session: SessionContext
  }
  export interface Session {
    isAuthorized: SimpleRolesIsAuthorized<UserRole>
    PublicData: {
      userId: User["id"]
      role: UserRole
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
    workflow: { include: { stages: { include: { stage: true } } } }
    form: { include: { questions: { include: { question: true } } } }
    candidates: true
  }
}>
export type ExtendedCandidate = Prisma.CandidateGetPayload<{
  include: {
    job: {
      include: {
        form: { include: { questions: true } }
        workflow: { include: { stages: { include: { stage: true } } } }
      }
    }
    workflowStage: { include: { stage: true } }
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

export type ExtendedQuestion = Prisma.QuestionGetPayload<{
  include: { forms: true; options: true }
}>
export type ExtendedForm = Prisma.FormGetPayload<{ include: { questions: true } }>
export type ExtendedFormQuestion = Prisma.FormQuestionGetPayload<{
  include: {
    question: {
      include: {
        options: true
      }
    }
  }
}>

export type AttachmentObject = {
  Key: string
  Location: string
}
