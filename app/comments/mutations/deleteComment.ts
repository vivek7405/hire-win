import Guard from "app/guard/ability"
import { Ctx, resolver } from "blitz"
import db, { CandidateActivityType, User } from "db"
import { z } from "zod"

export default Guard.authorize(
  "delete",
  "comment",
  resolver.pipe(
    resolver.zod(z.object({ commentId: z.string() })),
    resolver.authorize(),
    async ({ commentId }, ctx: Ctx) => {
      const comment = await db.comment.delete({
        where: { id: commentId },
        include: { stage: true },
      })

      let loggedInUser: User | null = null
      if (ctx?.session?.userId) {
        loggedInUser = await db.user.findFirst({ where: { id: ctx?.session?.userId } })
      }

      await db.candidateActivity.create({
        data: {
          title: `Comment deleted by ${loggedInUser?.name} in stage "${comment?.stage?.name}"`,
          type: CandidateActivityType.Comment_Deleted,
          performedByUserId: ctx?.session?.userId || "0",
          candidateId: comment?.candidateId,
        },
      })

      return comment
    }
  )
)
