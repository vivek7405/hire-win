import { z } from "zod"

export const Workflow = z.object({
  id: z.string().optional(),
  name: z.string().nonempty({ message: "Name can't be empty" }),
  slug: z.string().optional(),
})
export type WorkflowInputType = z.infer<typeof Workflow>

export const WorkflowStage = z.object({
  id: z.string().optional(),
  order: z.number().optional(),
  workflowId: z.string().optional(),
  stageId: z.string(),
})
export type WorkflowStageInputType = z.infer<typeof WorkflowStage>

export const WorkflowStages = z.object({
  workflowId: z.string().optional(),
  stageIds: z.string().array(),
})
export type WorkflowStagesInputType = z.infer<typeof WorkflowStages>
