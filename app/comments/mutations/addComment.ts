import { Ctx, resolver } from "blitz"
import db, { CandidateActivityType, User } from "db"
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
    include: { stage: true },
  })

  let loggedInUser: User | null = null
  if (ctx?.session?.userId) {
    loggedInUser = await db.user.findFirst({ where: { id: ctx?.session?.userId } })
  }

  await db.candidateActivity.create({
    data: {
      title: `Comment ${parentCommentId ? "replied" : "added"} by ${loggedInUser?.name} in stage "${
        comment?.stage?.name
      }"`,
      type: parentCommentId
        ? CandidateActivityType.Comment_Replied
        : CandidateActivityType.Comment_Added,
      performedByUserId: ctx?.session?.userId || "0",
      candidateId,
    },
  })

  return comment
}

export default resolver.pipe(resolver.zod(CommentsObj), resolver.authorize(), addComment)
