import { z } from "zod"

export const CommentsObj = z.object({
  id: z.string().optional(),
  text: z.string().nonempty({ message: "Comment can't be empty" }),
  creatorId: z.number().optional(),
  candidateId: z.string(),
  workflowStageId: z.string(),
  parentCommentId: z.string().optional(),
})
export type CommentsInputType = z.infer<typeof CommentsObj>
