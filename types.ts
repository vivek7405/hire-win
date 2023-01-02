// import { DefaultCtx, SessionContext, SimpleRolesIsAuthorized } from "blitz"
import { User } from "db"
import { Calendar, DailySchedule, Job, Prisma, Schedule, UserRole } from "@prisma/client"
import { SessionContext, SimpleRolesIsAuthorized } from "@blitzjs/auth"

export enum Currency {
  INR = "INR",
  USD = "USD",
  CAD = "CAD",
  AUD = "AUD",
  GBP = "GBP",
  EUR = "EUR",
  AED = "AED",
}

export enum SubscriptionStatus {
  ACTIVE = "active",
  PAST_DUE = "past_due",
  UNPAID = "unpaid",
  CANCELED = "canceled",
  INCOMPLETE = "incomplete",
  INCOMPLETE_EXPIRED = "incomplete_expired",
  TRIALING = "trialing",
}

export enum PlanName {
  FREE,
  LIFETIME_SET1,
  RECRUITER,
}

export enum DragDirection {
  HORIZONTAL = "horizontal",
  VERTICAL = "vertical",
}

export enum EmailTemplatePlaceholders {
  Candidate_Name = "Candidate_Name",
  Job_Title = "Job_Title",
  Job_Stage = "Job_Stage",
  Company_Name = "Company_Name",
  Sender_Name = "Sender_Name",
  Interviewer_Name = "Interviewer_Name",
}

export enum PlanFrequency {
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
}

export enum ToggleSize {
  SMALL = "SMALL",
  MEDIUM = "MEDIUM",
  LARGE = "LARGE",
}

export type IntroStep = {
  element: string
  title: string
  intro: any
}

export type IntroHint = {
  element: string
  hint: string
  hintPosition?: string
}

export type Plan = {
  name: PlanName
  priceId: string
  title: string
  pricePerMonth: number
  // pricePerYear: number
  // price: number
  frequency: PlanFrequency
  currencySymbol: string
  // description: string
  // features: string[]
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

declare module "@blitzjs/auth" {
  export interface Session {
    isAuthorized: SimpleRolesIsAuthorized<UserRole>
    PublicData: {
      userId: User["id"]
      role: UserRole
      companyId: string
    }
  }
}

declare module "blitz" {
  export interface Ctx {
    session: SessionContext
  }
}

// declare module "blitz" {
//   export interface Ctx extends DefaultCtx {
//     session: SessionContext
//   }
//   export interface Session {
//     isAuthorized: SimpleRolesIsAuthorized<UserRole>
//     PublicData: {
//       userId: User["id"]
//       role: UserRole
//       companyId: string
//     }
//   }
// }

export enum ShiftDirection {
  UP,
  DOWN,
}

export type ExtendedJob = Prisma.JobGetPayload<{
  include: {
    company: true
    users: true
    category: true
    stages: {
      include: { scoreCardQuestions: true; interviewer: true; stageUserScheduleCalendars: true }
    }
    formQuestions: { include: { options: true } }
    candidates: true
    createdBy: true
  }
}>
export type ExtendedCandidate = Prisma.CandidateGetPayload<{
  include: {
    job: {
      include: {
        formQuestions: { include: { options: true } }
        stages: { include: { interviewer: true; scoreCardQuestions: true; scores: true } }
      }
    }
    stage: { include: { interviewer: true; scoreCardQuestions: true; scores: true } }
    answers: { include: { formQuestion: { include: { options: true } } } }
    scores: true
    createdBy: true
  }
}>
export type ExtendedCategory = Prisma.CategoryGetPayload<{ include: { jobs: true } }>
export type ExtendedCandidatePool = Prisma.CandidatePoolGetPayload<{
  include: { candidates: true }
}>
// export type ExtendedUser = Prisma.UserGetPayload<{
//   include: {
//     jobs: {
//       include: {
//         job: true
//       }
//     }
//   }
// }>
export type ExtendedAnswer = Prisma.AnswerGetPayload<{
  include: {
    formQuestion: {
      include: {
        options: true
      }
    }
  }
}>
export type ExtendedStage = Prisma.StageGetPayload<{
  include: { scoreCardQuestions: true; scores: true; interviewer: true }
}>
// export type ExtendedWorkflow = Prisma.WorkflowGetPayload<{
//   include: { stages: { include: { stage: true; scoreCards: { include: { scoreCard: true } } } } }
// }>
// export type ExtendedWorkflowStage = Prisma.WorkflowStageGetPayload<{
//   include: { stage: true; scoreCards: { include: { scoreCard: true } }; interviewDetails: true }
// }>

// export type ExtendedQuestion = Prisma.QuestionGetPayload<{
//   include: { forms: true; options: true }
// }>
// export type ExtendedForm = Prisma.FormGetPayload<{ include: { questions: true } }>
export type ExtendedFormQuestion = Prisma.FormQuestionGetPayload<{
  include: {
    options: true
  }
}>

// export type ExtendedCardQuestion = Prisma.CardQuestionGetPayload<{
//   include: { scoreCards: true }
// }>
// export type ExtendedScoreCard = Prisma.ScoreCardGetPayload<{
//   include: {
//     cardQuestions: {
//       include: {
//         cardQuestion: true
//         scoreCard: { include: { jobWorkflowStages: true } }
//         scores: { include: { candidate: true } }
//       }
//     }
//   }
// }>
export type ExtendedScoreCardQuestion = Prisma.ScoreCardQuestionGetPayload<{
  include: {
    stage: true
    scores: { include: { candidate: true } }
  }
}> & { showNote: boolean }

export type AttachmentObject = {
  name: string
  key: string
  location: string
}

export type SubscriptionObject = {
  status: SubscriptionStatus
  daysLeft: number
}

export type InterviewDetailType = {
  interviewer: User & { calendars: Calendar[] } & {
    schedules: (Schedule & {
      dailySchedules: DailySchedule[]
    })[]
  }
  job: Job
  calendar: Calendar
  schedule: Schedule
  duration: number
}

export enum JobViewType {
  Active = "Active",
  // Expired = "Expired",
  Archived = "Archived",
}
