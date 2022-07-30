import { Ctx } from "blitz"
import db, { Prisma } from "db"

type UpdateCommentInput = Pick<Prisma.CommentUpdateArgs, "where" | "data">

async function updateComment({ where, data }: UpdateCommentInput, ctx: Ctx) {
  ctx.session.$authorize("ADMIN")

  const comment = await db.comment.update({
    where,
    data,
  })

  return comment
}

export default updateComment
