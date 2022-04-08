import { CandidateSource, EmploymentType, SalaryType } from "@prisma/client"
import { z } from "zod"

// type Literal = boolean | null | number | string
// type Json = Literal | { [key: string]: Json } | Json[]
// const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()])
// const jsonSchema: z.ZodSchema<Json> = z.lazy(() =>
//   z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)])
// )

export const ScoreCardJobWorkflowStageObj = z.object({
  id: z.string().nullable().optional(),
  scoreCardId: z.string(),
  jobId: z.string().optional(),
  workflowStageId: z.string(),
})
export type ScoreCardJobWorkflowStageObjInputType = z.infer<typeof ScoreCardJobWorkflowStageObj>

export const Job = z.object({
  id: z.string().optional(),
  slug: z.string().optional(),
  hidden: z.boolean().optional(),

  title: z.string().nonempty({ message: "Required" }),
  remote: z.boolean(),
  description: z.any(),

  categoryId: z.string().optional(),
  employmentType: z.array(z.nativeEnum(EmploymentType)),
  validThrough: z.date(),

  country: z.string(),
  state: z.string(),
  city: z.string(),

  currency: z.string(),
  minSalary: z.number(),
  maxSalary: z.number(),
  salaryType: z.nativeEnum(SalaryType),

  workflowId: z.string().optional(),
  scoreCards: z.array(ScoreCardJobWorkflowStageObj).optional(),

  formId: z.string().optional(),
})
export type JobInputType = z.infer<typeof Job>

export const Answer = z.object({
  id: z.string().optional(),
  value: z.string(),
  questionId: z.string().optional(),
})
export type AnswerInputType = z.infer<typeof Answer>

export const Score = z.object({
  id: z.string().nullable().optional(),
  rating: z.number(),
  note: z.string().nullable().optional(),
  scoreCardQuestionId: z.string(),
  workflowStageId: z.string(),
})
export type ScoreInputType = z.infer<typeof Score>

export const Candidate = z.object({
  id: z.string().optional(),
  name: z.string(),
  email: z.string(),
  resume: z
    .object({
      Location: z.string().optional(),
      Key: z.string().optional(),
    })
    .nullable(),
  slug: z.string().optional(),
  answers: z.array(Answer),
  scores: z.array(Score).optional(),
  jobId: z.string().optional(),
  source: z.nativeEnum(CandidateSource),
  workflowStageId: z.string().optional(),
})
export type CandidateInputType = z.infer<typeof Candidate>
