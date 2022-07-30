import { paginate, Ctx } from "blitz"
import db, { Prisma } from "db"

interface GetCommentsInput
  extends Pick<Prisma.CommentFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

async function getComments({ where, orderBy, skip = 0, take = 100 }: GetCommentsInput, ctx: Ctx) {
  ctx.session.$authorize("ADMIN")

  const {
    items: comments,
    hasMore,
    count,
  } = await paginate({
    skip,
    take,
    count: () => db.comment.count({ where }),
    query: (paginateArgs) =>
      db.comment.findMany({
        ...paginateArgs,
        where,
        orderBy,
      }),
  })

  return {
    comments,
    hasMore,
    count,
  }
}

export default getComments
