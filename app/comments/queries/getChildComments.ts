import { Ctx } from "blitz"
import db from "db"

async function getChildComments(parentCommentId: string, ctx: Ctx) {
  ctx.session.$authorize()

  const comments = await db.comment.findMany({
    where: { parentCommentId },
    include: {
      creator: { select: { name: true } },
    },
    orderBy: { createdAt: "asc" },
  })

  return comments
}

export default getChildComments
