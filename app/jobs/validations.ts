import { CandidateSource, EmploymentType, SalaryType } from "@prisma/client"
import { z } from "zod"

// type Literal = boolean | null | number | string
// type Json = Literal | { [key: string]: Json } | Json[]
// const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()])
// const jsonSchema: z.ZodSchema<Json> = z.lazy(() =>
//   z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)])
// )

export const Job = z.object({
  id: z.string().optional(),
  title: z.string().nonempty({ message: "Required" }),
  description: z.any(),
  categoryId: z.string().optional(),
  workflowId: z.string().optional(),
  formId: z.string().optional(),
  slug: z.string().optional(),

  country: z.string(),
  state: z.string(),
  city: z.string(),

  remote: z.boolean(),
  hidden: z.boolean().optional(),

  currency: z.string(),
  minSalary: z.number(),
  maxSalary: z.number(),
  salaryType: z.nativeEnum(SalaryType),

  employmentType: z.array(z.nativeEnum(EmploymentType)),
  validThrough: z.date(),
})
export type JobInputType = z.infer<typeof Job>

export const Answer = z.object({
  id: z.string().optional(),
  value: z.string(),
  questionId: z.string().optional(),
})
export type AnswerInputType = z.infer<typeof Answer>

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
  jobId: z.string().optional(),
  source: z.nativeEnum(CandidateSource),
  workflowStageId: z.string().optional(),
})
export type CandidateInputType = z.infer<typeof Candidate>
