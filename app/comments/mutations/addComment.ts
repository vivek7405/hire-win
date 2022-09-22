import { Ctx, resolver } from "blitz"
import db from "db"
import { CommentsInputType, CommentsObj } from "../validations"

async function addComment(data: CommentsInputType, ctx: Ctx) {
  const { text, parentCommentId, candidateId, stageId } = CommentsObj.parse(data)

  const comment = await db.comment.create({
    data: {
      text,
      creatorId: ctx.session.userId || "0",
      parentCommentId,
      candidateId,
      stageId,
    },
  })

  return comment
}

export default resolver.pipe(resolver.zod(CommentsObj), resolver.authorize(), addComment)
