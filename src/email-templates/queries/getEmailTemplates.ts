import { resolver } from "@blitzjs/rpc"
import { paginate } from "blitz"
import db, { Prisma } from "db"

interface GetEmailTemplatesInput
  extends Pick<Prisma.EmailTemplateFindManyArgs, "where" | "skip" | "take"> {}

const getEmailTemplates = resolver.pipe(
  resolver.authorize(),
  async ({ where, skip = 0, take = 100 }: GetEmailTemplatesInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: emailTemplates,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.emailTemplate.count({ where }),
      query: (paginateArgs) =>
        db.emailTemplate.findMany({
          ...paginateArgs,
          where,
          include: {
            _count: { select: { emails: true } },
          },
          orderBy: { createdAt: "asc" },
        }),
    })

    return {
      emailTemplates,
      nextPage,
      hasMore,
      count,
    }
  }
)

export default getEmailTemplates
