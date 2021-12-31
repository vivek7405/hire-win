import { Stage } from "app/stages/validations"
import { z } from "zod"

export const Workflow = z.object({
  name: z.string(),
  slug: z.string().optional(),
})
export type WorkflowInputType = z.infer<typeof Workflow>

export const WorkflowStage = z.object({
  id: z.number().optional(),
  order: z.number().optional(),
  workflowId: z.string().optional(),
  stageId: z.string(),
})
export type WorkflowStageInputType = z.infer<typeof WorkflowStage>
