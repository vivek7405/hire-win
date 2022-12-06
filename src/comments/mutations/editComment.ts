import { resolver } from "@blitzjs/rpc";
import Guard from "src/guard/ability"
import { Ctx } from "blitz";
import db, { CandidateActivityType, User } from "db"
import { z } from "zod"

export default Guard.authorize(
  "update",
  "comment",
  resolver.pipe(
    resolver.zod(
      z.object({
        commentId: z.string(),
        editText: z.string(),
      })
    ),
    resolver.authorize(),
    async ({ commentId, editText }, ctx: Ctx) => {
      const comment = await db.comment.update({
        where: { id: commentId },
        data: { text: editText },
        include: { stage: true },
      })

      let loggedInUser: User | null = null
      if (ctx?.session?.userId) {
        loggedInUser = await db.user.findFirst({ where: { id: ctx?.session?.userId } })
      }

      await db.candidateActivity.create({
        data: {
          title: `Comment edited by ${loggedInUser?.name} in stage "${comment?.stage?.name}"`,
          type: CandidateActivityType.Comment_Edited,
          performedByUserId: ctx?.session?.userId || "0",
          candidateId: comment?.candidateId,
        },
      })

      return comment
    }
  )
)
