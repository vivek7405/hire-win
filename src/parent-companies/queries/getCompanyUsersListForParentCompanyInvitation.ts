import Guard from "src/guard/ability"
import { Ctx } from "blitz"
import db from "db"

async function getCompanyUsersListForParentCompanyInvitation({ parentCompanyId }, ctx: Ctx) {
  ctx.session.$authorize()

  const parentCompanyUsers = await db.parentCompanyUser?.findMany({
    where: { parentCompanyId: parentCompanyId || "0" },
  })

  const companyUsers = await db.companyUser.findMany({
    where: {
      companyId: ctx.session?.companyId,
      userId: {
        not: ctx.session.userId || "0",
        notIn: parentCompanyUsers?.map((pcu) => pcu.userId),
      },
    },
    include: { company: true, user: true },
  })

  return companyUsers
}

export default getCompanyUsersListForParentCompanyInvitation
