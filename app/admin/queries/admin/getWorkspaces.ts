import { paginate, Ctx } from "blitz"
import db, { Prisma } from "db"

interface GetWorkspacesInput
  extends Pick<Prisma.CompanyFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

async function getWorkspaces(
  { where, orderBy, skip = 0, take = 100 }: GetWorkspacesInput,
  ctx: Ctx
) {
  ctx.session.$authorize("ADMIN")

  const {
    items: workspaces,
    hasMore,
    count,
  } = await paginate({
    skip,
    take,
    count: () => db.company.count({ where }),
    query: (paginateArgs) =>
      db.company.findMany({
        ...paginateArgs,
        where,
        orderBy,
      }),
  })

  return {
    workspaces,
    hasMore,
    count,
  }
}

export default getWorkspaces
