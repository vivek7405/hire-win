import { EmploymentType, SalaryType } from "@prisma/client"
import { StageObj } from "app/stages/validations"
import { z } from "zod"

export const Job = z.object({
  id: z.string().optional(),
  slug: z.string().optional(),
  hidden: z.boolean().optional(),

  title: z.string().nonempty({ message: "Required" }),
  remote: z.boolean(),
  description: z.any(),
  postToGoogle: z.boolean(),

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

  // workflowId: z.string().optional(),
  stages: z.array(StageObj).optional(),
  // scoreCards: z.array(ScoreCardJobWorkflowStageObj).optional(),

  formId: z.string().optional(),
})
export type JobInputType = z.infer<typeof Job>
