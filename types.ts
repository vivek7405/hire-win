import { DefaultCtx, SessionContext, SimpleRolesIsAuthorized } from "blitz"
import { User } from "db"
import { Calendar, DailySchedule, Prisma, Schedule, UserRole } from "@prisma/client"

export enum PlanName {
  PRO,
}

export enum DragDirection {
  HORIZONTAL = "horizontal",
  VERTICAL = "vertical",
}

export enum EmailTemplatePlaceholders {
  Candidate_Name = "Candidate_Name",
  Job_Title = "Job_Title",
  Company_Name = "Company_Name",
  Sender_Name = "Sender_Name",
  Interviewer_Name = "Interviewer_Name",
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

export type FormStep = {
  name: string
  renderComponent: any
  validationSchema: any
}

export type CardType = {
  id: string
  title: string
  description: string
  renderContent: any
  isDragDisabled?: boolean
}
export type KanbanColumnType = {
  id: string
  title: string
  cards: CardType[]
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
      companyId: number
    }
  }
}

export enum ShiftDirection {
  UP,
  DOWN,
}

export type ExtendedJob = Prisma.JobGetPayload<{
  include: {
    users: true
    category: true
    workflow: { include: { stages: { include: { stage: true; interviewDetails: true } } } }
    form: { include: { questions: { include: { question: true } } } }
    candidates: true
    scoreCards: { include: { scoreCard: true } }
    interviewDetails: true
  }
}>
export type ExtendedCandidate = Prisma.CandidateGetPayload<{
  include: {
    job: {
      include: {
        form: { include: { questions: { include: { question: { include: { options: true } } } } } }
        workflow: { include: { stages: { include: { stage: true; interviewDetails: true } } } }
        scoreCards: {
          include: {
            scoreCard: {
              include: { cardQuestions: { include: { cardQuestion: true; scores: true } } }
            }
          }
        }
      }
    }
    workflowStage: { include: { stage: true; interviewDetails: true } }
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
export type ExtendedCandidatePool = Prisma.CandidatePoolGetPayload<{
  include: { candidates: true }
}>
export type ExtendedUser = Prisma.UserGetPayload<{
  include: {
    jobs: {
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
export type ExtendedWorkflow = Prisma.WorkflowGetPayload<{
  include: { stages: { include: { stage: true; scoreCards: { include: { scoreCard: true } } } } }
}>
export type ExtendedWorkflowStage = Prisma.WorkflowStageGetPayload<{
  include: { stage: true; scoreCards: { include: { scoreCard: true } }; interviewDetails: true }
}>

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

export type ExtendedCardQuestion = Prisma.CardQuestionGetPayload<{
  include: { scoreCards: true }
}>
export type ExtendedScoreCard = Prisma.ScoreCardGetPayload<{
  include: {
    cardQuestions: {
      include: {
        cardQuestion: true
        scoreCard: { include: { jobWorkflowStages: true } }
        scores: { include: { candidate: true } }
      }
    }
  }
}>
export type ExtendedScoreCardQuestion = Prisma.ScoreCardQuestionGetPayload<{
  include: {
    scoreCard: { include: { jobWorkflowStages: true } }
    cardQuestion: true
    scores: { include: { candidate: true } }
  }
}> & { showNote: boolean }

export type AttachmentObject = {
  Key: string
  Location: string
}

export type InterviewDetailType = {
  interviewer: User & { calendars: Calendar[] } & {
    schedules: (Schedule & {
      dailySchedules: DailySchedule[]
    })[]
  }
  calendar: Calendar
  schedule: Schedule
  duration: number
}

export enum JobViewType {
  Active = "Active",
  Expired = "Expired",
  Archived = "Archived",
}
