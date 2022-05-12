import { Ctx } from "blitz"
import db from "db"

type GetCommentsInput = {
  candidateId: string
  workflowStageId: string
}
async function getCandidateStageComments(
  { candidateId, workflowStageId }: GetCommentsInput,
  ctx: Ctx
) {
  ctx.session.$authorize()

  const comments = await db.comment.findMany({
    where: {
      candidateId,
      workflowStageId,
      parentCommentId: null,
    },
    include: {
      creator: { select: { name: true } },
    },
    orderBy: { createdAt: "asc" },
  })

  return comments
}

export default getCandidateStageComments
