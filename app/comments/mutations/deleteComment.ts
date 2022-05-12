import Guard from "app/guard/ability"
import { resolver } from "blitz"
import db from "db"
import { z } from "zod"

export default Guard.authorize(
  "delete",
  "comment",
  resolver.pipe(
    resolver.zod(z.object({ commentId: z.string() })),
    resolver.authorize(),
    async ({ commentId }) => {
      const comment = await db.comment.delete({
        where: { id: commentId },
      })
      return comment
    }
  )
)
