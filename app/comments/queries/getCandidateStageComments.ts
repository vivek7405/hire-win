import { Ctx } from "blitz"
import db from "db"

type GetCommentsInput = {
  candidateId: string
  stageId: string
}
async function getCandidateStageComments({ candidateId, stageId }: GetCommentsInput, ctx: Ctx) {
  ctx.session.$authorize()

  const comments = await db.comment.findMany({
    where: {
      candidateId,
      stageId,
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
