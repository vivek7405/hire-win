import { paginate, Ctx } from "blitz"
import db, { Prisma } from "db"

interface GetEmailsInput
  extends Pick<Prisma.EmailFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

async function getEmails({ where, orderBy, skip = 0, take = 100 }: GetEmailsInput, ctx: Ctx) {
  ctx.session.$authorize("ADMIN")

  const {
    items: emails,
    hasMore,
    count,
  } = await paginate({
    skip,
    take,
    count: () => db.email.count({ where }),
    query: (paginateArgs) =>
      db.email.findMany({
        ...paginateArgs,
        where,
        orderBy,
      }),
  })

  return {
    emails,
    hasMore,
    count,
  }
}

export default getEmails
