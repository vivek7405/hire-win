import { paginate, Ctx } from "blitz"
import db, { Prisma } from "db"

interface GetEmailtemplatesInput
  extends Pick<Prisma.EmailTemplateFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

async function getEmailtemplates(
  { where, orderBy, skip = 0, take = 100 }: GetEmailtemplatesInput,
  ctx: Ctx
) {
  ctx.session.$authorize("ADMIN")

  const {
    items: emailtemplates,
    hasMore,
    count,
  } = await paginate({
    skip,
    take,
    count: () => db.emailTemplate.count({ where }),
    query: (paginateArgs) =>
      db.emailTemplate.findMany({
        ...paginateArgs,
        where,
        orderBy,
      }),
  })

  return {
    emailtemplates,
    hasMore,
    count,
  }
}

export default getEmailtemplates
