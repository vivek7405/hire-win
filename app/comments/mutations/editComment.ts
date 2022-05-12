import Guard from "app/guard/ability"
import { Ctx, resolver } from "blitz"
import db from "db"
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
    async ({ commentId, editText }) => {
      const comment = await db.comment.update({
        where: { id: commentId },
        data: { text: editText },
      })

      return comment
    }
  )
)
