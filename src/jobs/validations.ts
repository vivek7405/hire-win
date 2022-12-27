import { JobType, RemoteOption, SalaryType } from "@prisma/client"
import { StageObj } from "src/stages/validations"
import { z } from "zod"

export const Job = z.object({
  id: z.string().optional(),
  slug: z.string().optional(),
  hidden: z.boolean().optional(),

  title: z.string().nonempty({ message: "Required" }),
  remoteOption: z.nativeEnum(RemoteOption).optional(),
  description: z.string().optional(),
  postToGoogle: z.boolean(),

  categoryId: z.string().optional(),
  jobType: z.nativeEnum(JobType),
  // validThrough: z.date(),

  country: z.string(),
  state: z.string(),
  city: z.string(),

  showSalary: z.boolean().optional(),
  currency: z.string().optional(),
  minSalary: z.number().optional(),
  maxSalary: z.number().optional(),
  salaryType: z.nativeEnum(SalaryType).optional(),

  // workflowId: z.string().optional(),
  stages: z.array(StageObj).optional(),
  // scoreCards: z.array(ScoreCardJobWorkflowStageObj).optional(),

  // formId: z.string().optional(),
})
export type JobInputType = z.infer<typeof Job>
